/**
 * Rule-based clinical field extractor.
 *
 * Takes free text from speech recognition (e.g. "patient complains of chest pain
 * for 2 days, heart rate 88, BP 145 over 90, temperature 101 F") and returns
 * structured chart fields, each with a confidence score (0-100).
 *
 * Confidence rules:
 *   - value found with an explicit keyword AND unit, within normal human range -> 96-98
 *   - value found but unit missing / had to be converted                       -> 85-90
 *   - value outside a physiologically plausible range                           -> 55-65 (flag for review)
 */

export type FormKey =
  | 'reasonForVisit'
  | 'pulseRate'
  | 'bloodPressure'
  | 'temperature'
  | 'oxygenSaturation'
  | 'respiratoryRate'
  | 'weight'
  | 'height'
  | 'bloodSugar'
  | 'durationOfSymptoms'
  | 'severityLevel'
  | 'allergies'
  | 'currentMedications'
  | 'primaryDiagnosis'
  | 'symptoms';

export interface ExtractedField {
  key: FormKey;
  label: string;
  /** Value shown to the doctor, with unit */
  value: string;
  /** Value written into the form input */
  formValue: string;
  confidenceScore: number;
  note?: string;
}

// ---------- spoken-number normalisation ----------

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
};

/** Turns "one hundred and forty five" -> "145", "ninety eight point six" -> "98.6". */
function wordsToDigits(text: string): string {
  const numberWord = `(?:${[...Object.keys(UNITS), ...Object.keys(TENS), 'hundred', 'and', 'point'].join('|')})`;
  const run = new RegExp(`\\b${numberWord}(?:[\\s-]+${numberWord})*\\b`, 'gi');
  return text.replace(run, (match) => {
    const words = match.toLowerCase().split(/[\s-]+/).filter((w) => w !== 'and');
    if (words.length === 0 || words.every((w) => w === 'point')) return match;
    let intPart = 0;
    let current = 0;
    let decimals = '';
    let afterPoint = false;
    let used = false;
    for (const w of words) {
      if (w === 'point') { afterPoint = true; continue; }
      if (afterPoint) {
        if (w in UNITS && UNITS[w] < 10) decimals += String(UNITS[w]);
        continue;
      }
      if (w in UNITS) { current += UNITS[w]; used = true; }
      else if (w in TENS) { current += TENS[w]; used = true; }
      else if (w === 'hundred') { current = (current || 1) * 100; used = true; }
    }
    if (!used) return match;
    intPart += current;
    return decimals ? `${intPart}.${decimals}` : String(intPart);
  });
}

export function normalise(text: string): string {
  let t = ' ' + text + ' ';
  t = wordsToDigits(t);
  t = t
    .replace(/(\d)\s*(?:over|by|upon|slash)\s*(\d)/gi, '$1/$2') // 145 over 90
    .replace(/(\d)\s+(\d{2,3})\b(?=\s*(?:mm|millimet))/gi, '$1/$2') // "145 90 mmHg"
    .replace(/\bper ?cent\b/gi, '%')
    .replace(/\bdegrees?\b/gi, 'degrees')
    .replace(/\s+/g, ' ');
  return t.trim();
}

// ---------- helpers ----------

const num = String.raw`(\d{1,3}(?:\.\d{1,2})?)`;

function firstMatch(text: string, patterns: RegExp[]): RegExpMatchArray | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m;
  }
  return null;
}

function inRange(v: number, lo: number, hi: number) {
  return v >= lo && v <= hi;
}

function clean(phrase: string): string {
  return phrase
    .replace(/^[\s,:-]+|[\s,.;:-]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(?:a|an|the)\s+/i, '');
}

function capitalise(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Words that end a free-text phrase (so "complains of chest pain heart rate 88" stops at "heart rate")
const STOP = String.raw`(?=[.;]|,\s*(?:and\s+)?(?:heart|pulse|bp|blood|temp|temperature|oxygen|spo2|sats?|saturation|respiratory|resp|weight|height|sugar|glucose|allerg|medication|taking|diagnos|impression|for\s+(?:the\s+)?(?:past|last)?\s*\d)|\s+(?:heart rate|pulse|bp|blood pressure|temperature|temp|oxygen|spo2|saturation|respiratory|weight|height|blood sugar|glucose|allergic|allergies|he is|she is|patient is|currently|on medication|taking|diagnosis|diagnosed|impression|since|for (?:the )?(?:past |last )?\d)\b|$)`;

// ---------- main ----------

export function extractFields(rawText: string): ExtractedField[] {
  const text = normalise(rawText);
  const lower = text.toLowerCase();
  const out: ExtractedField[] = [];
  const add = (f: ExtractedField) => {
    if (!out.some((o) => o.key === f.key)) out.push(f);
  };

  // Blood pressure: "BP 145/90", "blood pressure is 120/80 mmHg"
  {
    const m = firstMatch(lower, [
      /(?:blood pressure|b\.?p\.?)\D{0,15}?(\d{2,3})\s*\/\s*(\d{2,3})\s*(mm ?hg|millimet(?:er|re)s? of mercury)?/,
      /\b(\d{2,3})\s*\/\s*(\d{2,3})\s*(mm ?hg|millimet(?:er|re)s? of mercury)/
    ]);
    if (m) {
      const sys = +m[1];
      const dia = +m[2];
      const ok = inRange(sys, 70, 250) && inRange(dia, 40, 150) && sys > dia;
      add({
        key: 'bloodPressure',
        label: 'Blood Pressure',
        value: `${sys}/${dia} mmHg`,
        formValue: `${sys}/${dia}`,
        confidenceScore: ok ? (m[3] || /blood pressure|b\.?p/.test(m[0]) ? 97 : 88) : 58,
        note: ok ? undefined : 'Unusual reading, please confirm'
      });
    }
  }

  // Heart / pulse rate
  {
    const m = firstMatch(lower, [
      new RegExp(String.raw`(?:heart rate|pulse rate|pulse|h\.?r\.?)\D{0,12}?${num}\s*(bpm|beats)?`),
      new RegExp(String.raw`${num}\s*(bpm|beats per minute)`)
    ]);
    if (m) {
      const v = Math.round(+m[1]);
      const ok = inRange(v, 30, 220);
      add({
        key: 'pulseRate',
        label: 'Heart Rate',
        value: `${v} bpm`,
        formValue: String(v),
        confidenceScore: ok ? (m[2] ? 98 : 94) : 55,
        note: ok ? undefined : 'Outside normal range, please confirm'
      });
    }
  }

  // Temperature (form is in °C; convert °F)
  {
    const m = firstMatch(lower, [
      new RegExp(String.raw`(?:temperature|temp|fever(?: of)?)\D{0,12}?${num}\s*(?:degrees)?\s*(f|fahrenheit|c|celsius|centigrade)?\b`),
      new RegExp(String.raw`${num}\s*degrees\s*(f|fahrenheit|c|celsius|centigrade)\b`)
    ]);
    if (m) {
      let v = +m[1];
      const unit = m[2] || '';
      let converted = false;
      const isF = /^f/.test(unit) || (!unit && v > 45);
      if (isF) {
        v = Math.round(((v - 32) * 5) / 9 * 10) / 10;
        converted = true;
      }
      const ok = inRange(v, 33, 43);
      add({
        key: 'temperature',
        label: 'Temperature',
        value: `${v} °C${converted ? ` (${m[1]} °F)` : ''}`,
        formValue: String(v),
        confidenceScore: ok ? (unit ? 96 : 87) : 58,
        note: ok ? (unit ? undefined : 'Unit not spoken, assumed') : 'Unusual temperature, please confirm'
      });
    }
  }

  // Oxygen saturation
  {
    const m = firstMatch(lower, [
      new RegExp(String.raw`(?:oxygen saturation|oxygen|o2 sat\w*|spo2|sp o2|sats?|saturation|saturating)\D{0,15}?${num}\s*(%)?`)
    ]);
    if (m) {
      const v = Math.round(+m[1]);
      const ok = inRange(v, 50, 100);
      add({
        key: 'oxygenSaturation',
        label: 'Oxygen Saturation',
        value: `${v} %`,
        formValue: String(v),
        confidenceScore: ok ? (m[2] ? 97 : 93) : 55,
        note: ok ? (v < 92 ? 'Low SpO2' : undefined) : 'Invalid percentage, please confirm'
      });
    }
  }

  // Respiratory rate
  {
    const m = lower.match(
      new RegExp(String.raw`(?:respiratory rate|respiration rate|respirations|resp rate|breathing rate|rr)\D{0,12}?${num}`)
    );
    if (m) {
      const v = Math.round(+m[1]);
      const ok = inRange(v, 6, 60);
      add({
        key: 'respiratoryRate',
        label: 'Respiratory Rate',
        value: `${v} /min`,
        formValue: String(v),
        confidenceScore: ok ? 95 : 58,
        note: ok ? undefined : 'Unusual reading, please confirm'
      });
    }
  }

  // Weight (form in kg)
  {
    const m = lower.match(
      new RegExp(String.raw`(?:weight|weighs|weighing)\D{0,12}?${num}\s*(kg|kilo\w*|lbs?|pounds?)?`)
    );
    if (m) {
      let v = +m[1];
      const unit = m[2] || '';
      const lbs = /^(lb|pound)/.test(unit);
      if (lbs) v = Math.round(v * 0.4536 * 10) / 10;
      const ok = inRange(v, 1, 300);
      add({
        key: 'weight',
        label: 'Weight',
        value: `${v} kg${lbs ? ` (${m[1]} lb)` : ''}`,
        formValue: String(v),
        confidenceScore: ok ? (unit ? 96 : 86) : 58
      });
    }
  }

  // Height (form in cm)
  {
    const m = lower.match(
      new RegExp(String.raw`(?:height|tall)\D{0,12}?${num}\s*(cm|centimet\w*|m\b|met(?:er|re)s?)?`)
    );
    if (m) {
      let v = +m[1];
      if (m[2] && /^m/.test(m[2]) && v < 3) v = Math.round(v * 100);
      const ok = inRange(v, 30, 250);
      add({
        key: 'height',
        label: 'Height',
        value: `${v} cm`,
        formValue: String(v),
        confidenceScore: ok ? (m[2] ? 95 : 85) : 58
      });
    }
  }

  // Blood sugar
  {
    const m = lower.match(
      new RegExp(String.raw`(?:blood sugar|sugar|glucose|rbs|fbs)\D{0,15}?${num}\s*(mg\/dl|mg per dl|milligrams?)?`)
    );
    if (m) {
      const v = +m[1];
      const ok = inRange(v, 20, 600);
      add({
        key: 'bloodSugar',
        label: 'Blood Sugar',
        value: `${v} mg/dL`,
        formValue: String(v),
        confidenceScore: ok ? (m[2] ? 96 : 90) : 58
      });
    }
  }

  // Chief complaint / reason for visit
  {
    const m = text.match(
      new RegExp(
        String.raw`(?:complain(?:s|ing|ed)? of|presents? with|presenting with|came in (?:with|for)|comes in with|reports?|reporting|suffering from|here for|chief complaint(?: is)?|history of)\s+(.+?)${STOP}`,
        'i'
      )
    );
    if (m) {
      const v = clean(m[1]);
      if (v.length > 2) {
        add({
          key: 'reasonForVisit',
          label: 'Chief Complaint',
          value: capitalise(v),
          formValue: capitalise(v),
          confidenceScore: v.split(' ').length <= 12 ? 92 : 80
        });
      }
    }
  }

  // Duration: "for 3 days", "since two weeks", "for the past week"
  {
    const m = lower.match(
      /(?:for|since|over)\s+(?:the\s+)?(?:past|last)?\s*(\d+|a|one|few|couple of)\s*(hours?|days?|weeks?|months?|years?)/
    );
    if (m) {
      const qty = /^(a|one)$/.test(m[1]) ? '1' : m[1];
      add({
        key: 'durationOfSymptoms',
        label: 'Duration of Symptoms',
        value: `${qty} ${m[2]}`,
        formValue: `${qty} ${m[2]}`,
        confidenceScore: 93
      });
    }
  }

  // Severity
  {
    const m = lower.match(/\b(mild|moderate|severe)\b/);
    if (m) {
      add({
        key: 'severityLevel',
        label: 'Severity',
        value: capitalise(m[1]),
        formValue: capitalise(m[1]),
        confidenceScore: 90
      });
    }
  }

  // Allergies
  {
    const none = /\bno (?:known )?(?:drug )?allergies\b|\bnkda\b/.test(lower);
    const m = text.match(new RegExp(String.raw`(?:allergic to|allergy to|allergies to|allergies:?)\s+(.+?)${STOP}`, 'i'));
    if (none) {
      add({ key: 'allergies', label: 'Allergies', value: 'No known allergies', formValue: 'No known allergies', confidenceScore: 95 });
    } else if (m) {
      const v = clean(m[1]);
      if (v) add({ key: 'allergies', label: 'Allergies', value: capitalise(v), formValue: capitalise(v), confidenceScore: 90 });
    }
  }

  // Current medications
  {
    const m = text.match(
      new RegExp(String.raw`(?:currently (?:taking|on)|is taking|taking|on medication(?:s)?(?: for \w+)?|medications?(?: are| include)?:?)\s+(.+?)${STOP}`, 'i')
    );
    if (m) {
      const v = clean(m[1]);
      if (v && !/^\d/.test(v)) {
        add({ key: 'currentMedications', label: 'Current Medications', value: capitalise(v), formValue: capitalise(v), confidenceScore: 86 });
      }
    }
  }

  // Diagnosis
  {
    const m = text.match(
      new RegExp(String.raw`(?:diagnosis(?: is)?|diagnosed with|impression(?: is)?|likely|suspect(?:ed)?)\s*:?\s+(.+?)${STOP}`, 'i')
    );
    if (m) {
      const v = clean(m[1]);
      if (v) add({ key: 'primaryDiagnosis', label: 'Primary Diagnosis', value: capitalise(v), formValue: capitalise(v), confidenceScore: 84 });
    }
  }

  // Symptoms: common symptom words mentioned anywhere
  {
    const known = [
      'chest pain', 'shortness of breath', 'breathlessness', 'headache', 'fever', 'cough', 'dry cough',
      'fatigue', 'tiredness', 'dizziness', 'nausea', 'vomiting', 'diarrhea', 'diarrhoea', 'abdominal pain',
      'stomach pain', 'back pain', 'joint pain', 'body pain', 'body ache', 'sore throat', 'cold',
      'runny nose', 'palpitations', 'swelling', 'rash', 'itching', 'weakness', 'loss of appetite',
      'weight loss', 'chills', 'sweating', 'blurred vision', 'numbness', 'constipation', 'insomnia'
    ];
    const found: string[] = [];
    for (const s of known) {
      if (lower.includes(s) && !found.some((f) => f.includes(s))) found.push(s);
    }
    // drop shorter duplicates like "cough" when "dry cough" is present
    const symptoms = found.filter((s) => !found.some((o) => o !== s && o.includes(s)));
    if (symptoms.length) {
      add({
        key: 'symptoms',
        label: 'Symptoms',
        value: symptoms.map(capitalise).join(', '),
        formValue: symptoms.map(capitalise).join('|'),
        confidenceScore: 91
      });
    }
  }

  return out;
}
