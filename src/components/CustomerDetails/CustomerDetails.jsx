import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Option,
  Radio,
  RadioGroup,
  Textarea,
} from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';
import {
  ANALYSIS_PERIODS,
  BCB_ROLES,
  COMPETITOR_CATALOG,
  CUSTOMER_SEGMENTS,
  EXISTING_MS_LICENSES,
  GEOGRAPHIES,
  INDUSTRIES,
  SALES_MOTIONS,
  SECURITY_STACK_CATEGORIES,
} from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import MultiSelect from '../shared/MultiSelect.jsx';
import styles from './CustomerDetails.module.css';

export default function CustomerDetails() {
  const {
    customer,
    fieldMeta,
    environment,
    caseSetup,
    currency,
    effectiveDevices,
    setCustomer,
    setEnvironment,
    setCaseSetup,
  } = useAppState();

  return (
    <div className={styles.root}>
      <StepMasthead
        description="The account size and the current security stack drive every number in the report."
      />

      {/* ------------------------ Customer Information ------------------------ */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Customer information</h2>

        <div className={styles.grid}>
          <FormField label="Account name" required meta={fieldMeta.accountName}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.accountName}
                  onChange={(_, d) => setCustomer('accountName', d.value)}
                  placeholder="Search by account name"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new account
                </button>
              </>
            )}
          </FormField>

          <FormField label="Opportunity ID" required meta={fieldMeta.opportunityId}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.opportunityId}
                  onChange={(_, d) => setCustomer('opportunityId', d.value)}
                  placeholder="e.g. 7-3F56BL3EVL"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new opportunity ID
                </button>
              </>
            )}
          </FormField>

          <FormField label="Opportunity name" required meta={fieldMeta.opportunityName}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.opportunityName}
                  onChange={(_, d) => setCustomer('opportunityName', d.value)}
                  placeholder="Search opportunity name"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new opportunity name
                </button>
              </>
            )}
          </FormField>
        </div>

        <Checkbox
          className={styles.notCustomer}
          checked={customer.notForCustomer}
          onChange={(_, d) => setCustomer('notForCustomer', d.checked)}
          label="This calculation is not for a customer"
        />

        <div className={styles.grid}>
          <FormField label="TPID" meta={fieldMeta.tpid}>
            {(id) => (
              <Input
                id={id}
                value={customer.tpid}
                onChange={(_, d) => setCustomer('tpid', d.value)}
                placeholder="e.g. 1234567"
                disabled={customer.notForCustomer}
              />
            )}
          </FormField>

          <FormField label="Opportunity close date">
            {(id) => (
              <Input
                id={id}
                type="date"
                value={customer.closeDate}
                onChange={(_, d) => setCustomer('closeDate', d.value)}
                disabled={customer.notForCustomer}
              />
            )}
          </FormField>

          <div />

          <FormField label="Industry" meta={fieldMeta.industry}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select industry"
                value={customer.industry}
                selectedOptions={customer.industry ? [customer.industry] : []}
                onOptionSelect={(_, d) => setCustomer('industry', d.optionValue)}
              >
                {INDUSTRIES.map((i) => (
                  <Option key={i} value={i}>
                    {i}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Geography (region)" required meta={fieldMeta.geography}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select region"
                value={GEOGRAPHIES.find((g) => g.id === customer.geography)?.label || ''}
                selectedOptions={customer.geography ? [customer.geography] : []}
                onOptionSelect={(_, d) => setCustomer('geography', d.optionValue)}
              >
                {GEOGRAPHIES.map((g) => (
                  <Option key={g.id} value={g.id} text={g.label}>
                    {g.label}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Currency">
            {(id) => <Input id={id} value={customer.geography ? currency : '—'} disabled />}
          </FormField>

          <FormField label="Customer segment" required meta={fieldMeta.segment}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select segment"
                value={customer.segment}
                selectedOptions={customer.segment ? [customer.segment] : []}
                onOptionSelect={(_, d) => setCustomer('segment', d.optionValue)}
              >
                {CUSTOMER_SEGMENTS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Primary sales motion" required meta={fieldMeta.salesMotion}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select sales motion"
                value={customer.salesMotion}
                selectedOptions={customer.salesMotion ? [customer.salesMotion] : []}
                onOptionSelect={(_, d) => setCustomer('salesMotion', d.optionValue)}
              >
                {SALES_MOTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField
            label="Number of users"
            required
            help="Used for pricing and benefit calculations"
            meta={fieldMeta.numberOfUsers}
          >
            {(id) => (
              <Input
                id={id}
                value={customer.numberOfUsers}
                onChange={(_, d) => setCustomer('numberOfUsers', d.value)}
                placeholder="e.g. 5000"
              />
            )}
          </FormField>

          <FormField label="Customer website" span={false}>
            {(id) => (
              <Input
                id={id}
                value={customer.website}
                onChange={(_, d) => setCustomer('website', d.value)}
                placeholder="e.g. contoso.com"
              />
            )}
          </FormField>

          <FormField
            label="Number of devices"
            help={
              effectiveDevices > 0 && !customer.numberOfDevices
                ? `Defaults to 1.2 × users — ${effectiveDevices.toLocaleString('en-US')} devices`
                : 'Endpoint count for Defender-related calculations'
            }
          >
            {(id) => (
              <Input
                id={id}
                value={customer.numberOfDevices}
                onChange={(_, d) => setCustomer('numberOfDevices', d.value)}
              />
            )}
          </FormField>
        </div>

        <div className={styles.roleBlock}>
          <span className={styles.roleLabel}>
            Role of Security BCB<span className={styles.required}> *</span>
          </span>
          <RadioGroup
            layout="horizontal"
            value={customer.bcbRole}
            onChange={(_, d) => setCustomer('bcbRole', d.value)}
          >
            {BCB_ROLES.map((r) => (
              <Radio key={r.id} value={r.id} label={r.label} />
            ))}
          </RadioGroup>
          {customer.bcbRole ? (
            <p className={styles.roleDetail}>
              {BCB_ROLES.find((r) => r.id === customer.bcbRole)?.detail}
            </p>
          ) : null}
        </div>

        <FormField label="Description" meta={fieldMeta.description}>
          {(id) => (
            <Textarea
              id={id}
              className={styles.textarea}
              value={customer.description}
              onChange={(_, d) => setCustomer('description', d.value)}
              placeholder="Optional notes about this customer or engagement"
              resize="vertical"
            />
          )}
        </FormField>
      </Card>

      {/* ------------------------ Customer Environment ------------------------ */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Customer environment</h2>
        <div className={styles.grid}>
          <FormField
            label="Existing MS licenses"
            required
            help="Drives SKU recommendations and upsell logic"
          >
            {(id) => (
              <MultiSelect
                id={id}
                options={EXISTING_MS_LICENSES}
                selected={environment.existingLicenses}
                onChange={(v) => setEnvironment('existingLicenses', v)}
                placeholder="Search license"
              />
            )}
          </FormField>

          <FormField
            label="Competitor products"
            help="Drives competitive displacement scenarios and TCO comparison (optional)"
          >
            {(id) => (
              <MultiSelect
                id={id}
                options={COMPETITOR_CATALOG.map((c) => c.name)}
                selected={environment.competitorProducts}
                onChange={(v) => setEnvironment('competitorProducts', v)}
                placeholder="Search competitor product"
                allowCustom
              />
            )}
          </FormField>

          <FormField
            label="Current security stack"
            required
            help="Drives competitive displacement recommendations"
          >
            {(id) => (
              <MultiSelect
                id={id}
                options={SECURITY_STACK_CATEGORIES}
                selected={environment.securityStack}
                onChange={(v) => setEnvironment('securityStack', v)}
                placeholder="Search security stack category"
              />
            )}
          </FormField>

          <FormField label="Seller alias">
            {(id) => <Input id={id} value={environment.sellerAlias} disabled />}
          </FormField>
        </div>
      </Card>

      {/* ------------------------- Business Case Setup ------------------------ */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Business case setup</h2>
        <div className={styles.grid}>
          <FormField
            label="Business case name"
            required
            help="Up to 100 characters."
          >
            {(id) => (
              <Input
                id={id}
                value={caseSetup.name}
                maxLength={100}
                onChange={(_, d) => setCaseSetup('name', d.value)}
                placeholder="Enter business case name"
              />
            )}
          </FormField>

          <FormField
            label="Analysis period (years)"
            required
            help="Determines the horizon for cost, benefit, ROI and reporting — and how many years of seats you enter per SKU"
          >
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select number of years"
                value={caseSetup.analysisPeriod ? `${caseSetup.analysisPeriod} years` : ''}
                selectedOptions={[String(caseSetup.analysisPeriod)]}
                onOptionSelect={(_, d) => setCaseSetup('analysisPeriod', Number(d.optionValue))}
              >
                {ANALYSIS_PERIODS.map((y) => (
                  <Option key={y} value={String(y)} text={`${y} years`}>
                    {y} {y === 1 ? 'year' : 'years'}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>
        </div>
      </Card>

      <StepFooter hint="Fill in what you know — you can move between steps freely and come back." />
    </div>
  );
}
