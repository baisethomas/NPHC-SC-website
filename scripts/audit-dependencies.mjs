#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const auditTargets = [
  {
    name: 'application',
    cwd: process.cwd(),
    knownHighAndCritical: new Map([
      ['@genkit-ai/core', 'high'],
      ['@genkit-ai/google-cloud', 'high'],
      ['@grpc/grpc-js', 'high'],
      ['@opentelemetry/auto-instrumentations-node', 'high'],
      ['@opentelemetry/sdk-node', 'high'],
      // Same Genkit-pinned otel chain as above; names surfaced after the
      // July 2026 dependency-PR merges reshuffled the lockfile.
      ['@opentelemetry/propagator-jaeger', 'high'],
      ['@opentelemetry/sdk-trace-node', 'high'],
      ['@firebase/firestore', 'high'],
      ['@firebase/firestore-compat', 'high'],
      ['@genkit-ai/ai', 'high'],
      ['@genkit-ai/firebase', 'high'],
      ['@genkit-ai/next', 'high'],
      ['@google-cloud/firestore', 'high'],
      ['@google-cloud/modelarmor', 'high'],
      ['@google-cloud/opentelemetry-cloud-trace-exporter', 'high'],
      ['@grpc/proto-loader', 'high'],
      ['@opentelemetry/exporter-trace-otlp-grpc', 'high'],
      ['@opentelemetry/otlp-grpc-exporter-base', 'high'],
      ['@opentelemetry/otlp-transformer', 'high'],
      ['@types/request', 'high'],
      ['ajv', 'high'],
      ['dotprompt', 'high'],
      ['express', 'high'],
      ['fast-uri', 'high'],
      ['fast-xml-parser', 'critical'],
      ['firebase', 'high'],
      ['firebase-admin', 'high'],
      ['form-data', 'high'],
      ['gaxios', 'high'],
      ['glob', 'high'],
      ['google-gax', 'high'],
      ['handlebars', 'critical'],
      ['linkify-it', 'high'],
      ['markdown-it', 'high'],
      ['minimatch', 'high'],
      ['next', 'high'],
      ['node-forge', 'high'],
      ['path-to-regexp', 'high'],
      ['picomatch', 'high'],
      ['proto3-json-serializer', 'high'],
      ['protobufjs', 'critical'],
      ['retry-request', 'high'],
      ['rimraf', 'high'],
      ['ws', 'high'],
    ]),
  },
  {
    name: 'functions',
    cwd: new URL('../functions/', import.meta.url),
    knownHighAndCritical: new Map(),
  },
];

function runAudit(target) {
  let output = '';

  try {
    output = execFileSync('npm', ['audit', '--omit=dev', '--json'], {
      cwd: target.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    output = error.stdout?.toString() ?? '';
    if (!output) {
      throw new Error(`Unable to run npm audit for ${target.name}: ${error.message}`);
    }
  }

  let report;
  try {
    report = JSON.parse(output);
  } catch {
    throw new Error(`npm audit returned invalid JSON for ${target.name}.`);
  }

  const vulnerabilities = report.vulnerabilities ?? {};
  const blocking = Object.entries(vulnerabilities)
    .filter(([, vulnerability]) => ['high', 'critical'].includes(vulnerability.severity))
    .map(([name, vulnerability]) => ({ name, severity: vulnerability.severity }));
  const unexpected = blocking.filter(({ name }) => !target.knownHighAndCritical.has(name));
  const changedSeverity = blocking.filter(
    ({ name, severity }) =>
      target.knownHighAndCritical.has(name) && target.knownHighAndCritical.get(name) !== severity
  );
  const missing = [...target.knownHighAndCritical.keys()].filter(
    (name) => !blocking.some((vulnerability) => vulnerability.name === name)
  );
  const counts = report.metadata?.vulnerabilities ?? {};

  console.log(
    `${target.name}: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
      `${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low`
  );

  if (missing.length) {
    console.log(`${target.name}: resolved exceptions: ${missing.join(', ')}`);
  }

  if (unexpected.length || changedSeverity.length) {
    throw new Error(
      `${target.name}: untriaged high/critical advisories: ${[
        ...unexpected.map(({ name }) => name),
        ...changedSeverity.map(({ name, severity }) => `${name} (${severity})`),
      ].join(', ')}. ` +
        'Update DEPENDENCY_POLICY.md and this baseline only after triage.'
    );
  }
}

for (const target of auditTargets) {
  runAudit(target);
}
