import defender from '../../assets/products/defender.svg';
import entra from '../../assets/products/entra.svg';
import intune from '../../assets/products/intune.svg';
import purview from '../../assets/products/purview.svg';
import sentinel from '../../assets/products/sentinel.svg';

/**
 * The Microsoft security mark that answers each competitor capability.
 *
 * Imported as URLs and rendered through <img> rather than inlined. Four of the
 * five files came out of the same design tool and shipped identical gradient
 * ids; inlining them into one document would have made the last one on the page
 * repaint the others. Separate documents cannot collide, and the ids have been
 * namespaced besides, so either route is safe now.
 *
 * Keyed by the capability on a competitor row, because that is what the landing
 * page has — the page shows spend categories rather than vendor brands, so the
 * category is the only thing it can map from.
 */
const LOGOS = {
  'Endpoint protection': { src: defender, name: 'Microsoft Defender', short: 'Defender' },
  'Email security': { src: defender, name: 'Microsoft Defender', short: 'Defender' },
  'Cloud security': { src: defender, name: 'Microsoft Defender', short: 'Defender' },
  'Vulnerability management': { src: defender, name: 'Microsoft Defender', short: 'Defender' },
  'Identity & access': { src: entra, name: 'Microsoft Entra', short: 'Entra' },
  'Privileged access': { src: entra, name: 'Microsoft Entra', short: 'Entra' },
  'Network / SASE': { src: entra, name: 'Microsoft Entra', short: 'Entra' },
  'SIEM / SOC': { src: sentinel, name: 'Microsoft Sentinel', short: 'Sentinel' },
  'Data loss prevention': { src: purview, name: 'Microsoft Purview', short: 'Purview' },
};

export const logoFor = (solution) => LOGOS[solution] || null;

/**
 * Distinct marks for a set of capabilities, in the order they first appear.
 *
 * `name` is the full product name, kept for alt text and anywhere the mark is
 * not carrying its own label. `short` is what goes under the logo — beside a
 * recognisable mark, "Microsoft" on every one of three is three redundant
 * words in a row.
 */
export function logosFor(solutions = []) {
  const seen = new Set();
  const out = [];
  solutions.forEach((s) => {
    const logo = logoFor(s);
    if (!logo || seen.has(logo.name)) return;
    seen.add(logo.name);
    out.push(logo);
  });
  return out;
}

export { defender, entra, intune, purview, sentinel };
