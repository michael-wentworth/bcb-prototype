import React from 'react';
import { Card, Dropdown, Input, Option } from '@fluentui/react-components';
import { GEOGRAPHIES, INDUSTRIES } from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import styles from './Capability.module.css';

const PERIODS = [3, 4, 5];

/**
 * The customer details the capability model actually consumes.
 *
 * Deliberately short. Seat count and analysis period drive every figure;
 * industry and region colour the narrative. The CRM identifiers the old step 1
 * carried — TPID, opportunity id, sales motion — are not inputs to a capability
 * delta, and this flow is meant to be finishable in a meeting.
 */
export default function CustomerFields() {
  const { customer, caseSetup, setCustomer, setCaseSetup, fieldMeta } = useAppState();

  return (
    <Card className={styles.card}>
      <div>
        <h2 className={styles.cardTitle}>Who is this for?</h2>
      </div>

      <div className={styles.tiles} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <FormField label="Account name" required meta={fieldMeta.accountName}>
          <Input
            value={customer.accountName}
            onChange={(_, d) => setCustomer('accountName', d.value)}
            placeholder="Search by account name"
          />
        </FormField>

        <FormField label="Number of users" required meta={fieldMeta.numberOfUsers}>
          <Input
            value={customer.numberOfUsers}
            onChange={(_, d) => setCustomer('numberOfUsers', d.value)}
            placeholder="e.g. 5000"
          />
        </FormField>

        <FormField label="Industry" meta={fieldMeta.industry}>
          <Dropdown
            value={customer.industry || ''}
            selectedOptions={customer.industry ? [customer.industry] : []}
            onOptionSelect={(_, d) => setCustomer('industry', d.optionValue)}
            placeholder="Select industry"
          >
            {INDUSTRIES.map((name) => (
              <Option key={name} value={name}>{name}</Option>
            ))}
          </Dropdown>
        </FormField>

        <FormField label="Geography (region)" required meta={fieldMeta.geography}>
          <Dropdown
            value={GEOGRAPHIES.find((g) => g.id === customer.geography)?.label || ''}
            selectedOptions={customer.geography ? [customer.geography] : []}
            onOptionSelect={(_, d) => setCustomer('geography', d.optionValue)}
            placeholder="Select region"
          >
            {GEOGRAPHIES.map((g) => (
              <Option key={g.id} value={g.id}>{g.label}</Option>
            ))}
          </Dropdown>
        </FormField>

        <FormField label="Analysis period (years)"
          help="Horizon for cost, benefit and ROI">
          <Dropdown
            value={`${caseSetup.analysisPeriod} years`}
            selectedOptions={[String(caseSetup.analysisPeriod)]}
            onOptionSelect={(_, d) => setCaseSetup('analysisPeriod', Number(d.optionValue))}
          >
            {PERIODS.map((y) => (
              <Option key={y} value={String(y)}>{`${y} years`}</Option>
            ))}
          </Dropdown>
        </FormField>
      </div>
    </Card>
  );
}
