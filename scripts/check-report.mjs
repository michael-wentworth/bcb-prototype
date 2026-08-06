/* Reconciliation harness for the executive report.
   node scripts/check-report.mjs */
import { MY_CASES, EXAMPLE_CASES } from '../src/data/caseLibrary.js';
import { buildCapabilityCase, num } from '../src/data/capabilityModel.js';
import { buildConfidence } from '../src/data/confidence.js';
import { buildReport } from '../src/data/reportModel.js';

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails += 1;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  — ' + detail : ''}`);
};

const CASES = [...MY_CASES, ...EXAMPLE_CASES];
for (const cs of CASES) {
  const inp = cs.input || {};
  const i = { ...inp, ...(inp.customer || {}), ...(inp.caseSetup || {}) };
  const c = buildCapabilityCase({
    analysisPeriod: i.analysisPeriod,
    numberOfUsers: i.numberOfUsers,
    currentLicenses: i.currentLicenses || [],
    futureLicenses: i.futureLicenses || [],
    contracts: i.capabilityContracts || [],
    seatsByLicense: i.seatsByLicense || {},
    rateByLicense: i.rateByLicense || {},
  });
  const conf = buildConfidence({
    capabilityCase: c,
    customer: i,
    caseSetup: i,
    currentLicenses: i.currentLicenses || [],
    futureLicenses: i.futureLicenses || [],
    seatsByLicense: i.seatsByLicense || {},
    rateByLicense: i.rateByLicense || {},
    contracts: i.capabilityContracts || [],
  });
  const r = buildReport({
    capabilityCase: c,
    caseConfidence: conf,
    currentLicenses: i.currentLicenses || [],
    futureLicenses: i.futureLicenses || [],
    contracts: i.capabilityContracts || [],
    rateByLicense: i.rateByLicense || {},
    customer: i,
  });

  console.log(`\n${cs.id}  (${i.accountName})`);

  /* 1. every coverage row reconciles: today + gained − lost === after */
  r.coverage.forEach((row) => {
    check(
      `${row.label}: ${row.today.covered} + ${row.gained} − ${row.lost} = ${row.future.covered}`,
      row.today.covered + row.gained - row.lost === row.future.covered,
    );
  });

  /* 2. the estate-wide gain agrees with the sum of the rows and the summary */
  const rowGain = r.coverage.reduce((s, row) => s + row.gained, 0);
  const said = Number(/adds (\d+) new capabilit/.exec(r.summary)?.[1]);
  check(`summary gain ${said} === row total ${rowGain}`, said === rowGain);

  /* 3. the stack credits each capability once, and totals the same gain */
  const stackAdds = r.stack.reduce((s, x) => s + x.adds.length, 0);
  const allAdds = r.stack.flatMap((x) => x.adds);
  check(`stack adds ${stackAdds} === gain ${rowGain}`, stackAdds === rowGain);
  check('no capability credited twice', new Set(allAdds).size === allAdds.length);

  /* 4. every stack card has a description */
  check('every product card has a blurb', r.stack.every((x) => x.blurb), r.stack.filter((x) => !x.blurb).map((x) => x.id).join(', '));

  /* 5. the waterfall balances AND lands on the real future bill */
  const stepped = r.financial.steps.reduce((acc, s) => (s.kind === 'total' ? s.value : acc + s.value), 0);
  check(`waterfall balances (${Math.round(stepped)} === ${Math.round(r.financial.futureSpend)})`, Math.abs(stepped - r.financial.futureSpend) < 1);
  const trueFuture = (c.futureByYear.at(-1) || 0) + r.financial.continuingSpend;
  check(`final bar === real future bill (${Math.round(r.financial.futureSpend)} === ${Math.round(trueFuture)})`, Math.abs(r.financial.futureSpend - trueFuture) < 1);

  /* 6. nothing is NaN */
  const nums = [r.kpis.annualSavings, r.kpis.annualInvestment, r.financial.futureSpend, ...r.financial.steps.map((s) => s.value)];
  check('no NaN in the figures', nums.every((v) => Number.isFinite(v)));

  console.log(`   roi ${r.kpis.roi === null ? '—' : Math.round(r.kpis.roi * 100) + '%'} | steps ${r.steps.length} | assumptions ${r.assumptions.length} | dropped ${r.consolidation.dropped.length}`);
}

/* --- the two states the fixtures do not cover ---------------------------- */

console.log('\nformatted competitor cost ("1,350,000")');
{
  const contracts = [{ id: 'x', vendor: 'CrowdStrike Falcon', capabilityIds: ['edr'], annualCost: '1,350,000', yearContractEnds: '2027' }];
  const c = buildCapabilityCase({ numberOfUsers: 18000, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], contracts });
  const r = buildReport({ capabilityCase: c, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], contracts });
  check('todaySpend is finite', Number.isFinite(r.financial.steps[0].value), String(r.financial.steps[0].value));
  check('comma stripped', r.financial.steps[0].value === c.currentAnnual + 1350000);
}

console.log('\nnegotiated rate below the current bundle (E3 list 39 -> E5 at 30)');
{
  const c = buildCapabilityCase({ numberOfUsers: 5000, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], rateByLicense: { 'm365-e5': '30' } });
  const r = buildReport({ capabilityCase: c, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], rateByLicense: { 'm365-e5': '30' } });
  check('Microsoft step is negative', r.financial.microsoftChange < 0, String(Math.round(r.financial.microsoftChange)));
  check('final bar === real future bill', Math.abs(r.financial.futureSpend - c.futureByYear.at(-1)) < 1, `${Math.round(r.financial.futureSpend)} vs ${Math.round(c.futureByYear.at(-1))}`);
  check('a "spend falls" assumption is present', r.assumptions.some((a) => a.label === 'Microsoft spend falls'));
}

console.log('\nnamed incumbent that cannot be counted');
{
  const contracts = [{ id: 'x', vendor: 'CrowdStrike Falcon', capabilityIds: ['edr'], annualCost: '1350000', yearContractEnds: '2035', soleUseConfirmed: true }];
  const c = buildCapabilityCase({ numberOfUsers: 18000, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], contracts });
  const r = buildReport({ capabilityCase: c, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5'], contracts, customer: { accountName: 'Contoso' } });
  check('summary does not claim nothing was named', !/No incumbent spend has been named/.test(r.summary), r.summary.slice(-120));
  check('cost driver does not either', !/No incumbent spend has been named/.test(r.drivers[0].text), r.drivers[0].text);
}

console.log('\npartly negotiated rates');
{
  const rate = { sentinel: '6' };
  const c = buildCapabilityCase({ numberOfUsers: 5000, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5', 'sentinel'], rateByLicense: rate });
  const r = buildReport({ capabilityCase: c, currentLicenses: ['m365-e3'], futureLicenses: ['m365-e5', 'sentinel'], rateByLicense: rate });
  const line = r.assumptions.find((a) => a.label === 'Microsoft pricing').value;
  check('names both sides', /Sentinel/.test(line) && /still at list/.test(line), line);
}

console.log(fails === 0 ? '\nall reconciled\n' : `\n${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
