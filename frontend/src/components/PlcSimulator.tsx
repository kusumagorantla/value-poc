import React, { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  clientIp: string;
  storageMode: string;
  status: string;
  latencyMs: number;
  rawPayload: string;
  createdAt: string;
}

interface RecordedRecord {
  id: string;
  serialNumber: string;
  stationCode: string;
  stepCode: number;
  storageMode: string;
  createdAt: string;
  values: Array<{
    id: string;
    operationCode: number;
    resultCode: number;
    valueNumeric?: number;
    valueText?: string;
  }>;
}

export const PlcSimulator: React.FC = () => {
  const [rawJson, setRawJson] = useState<string>(JSON.stringify({
    product_context: {
      product_id: "MATERIAL-1",
      product_serial_no: "cee348d8-daa0-4730-8d5e-ac59311af94b"
    },
    time_context: {
      timestamp: new Date().toISOString()
    },
    process_context: {
      station_id: "ST060.1",
      process_step_id: 11001,
      station_mode: 0,
      process_step_result: 1,
      wpc_no: "587",
      machine_time: 23.6,
      cycle_time: 35.12
    },
    process_results: [
      { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50032, value_numeric: 5.12 },
      { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50033, value_numeric: 92.4 },
      { process_operation_id: 123022, process_operation_result: 1, process_result_id: 50039, value_numeric: 4.95 },
      { process_operation_id: 123022, process_operation_result: 1, process_result_id: 50040, value_numeric: 88.1 },
      { process_operation_id: 123024, process_operation_result: 1, process_result_id: 50129, value_text: "123-TRE-AC" }
    ]
  }, null, 2));

  const [response, setResponse] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [records, setRecords] = useState<RecordedRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchInspectionData = async () => {
    try {
      const recRes = await fetch('http://localhost:5000/api/v1/traceability/process-results?limit=10');
      if (recRes.ok) setRecords(await recRes.json());

      const logRes = await fetch('http://localhost:5000/api/v1/traceability/audit-logs?limit=10');
      if (logRes.ok) setAuditLogs(await logRes.json());
    } catch (err) {
      console.error('Error fetching inspection data:', err);
    }
  };

  useEffect(() => {
    fetchInspectionData();
  }, []);

  const handleTriggerCycle = async () => {
    setLoading(true);
    setResponse(null);
    setLatencyMs(null);

    const startTime = performance.now();
    try {
      const parsedBody = JSON.parse(rawJson);
      const res = await fetch('http://localhost:5000/api/v1/traceability/process-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody)
      });
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      const data = await res.json();
      setResponse(data);
      await fetchInspectionData();
    } catch (err: any) {
      setResponse({ status: 'ERROR', message: err.message });
    }
    setLoading(false);
  };

  const handleLoadNominalPreset = () => {
    setRawJson(JSON.stringify({
      product_context: {
        product_id: "MATERIAL-1",
        product_serial_no: "cee348d8-daa0-4730-8d5e-ac59311af94b"
      },
      time_context: {
        timestamp: new Date().toISOString()
      },
      process_context: {
        station_id: "ST060.1",
        process_step_id: 11001,
        station_mode: 0,
        process_step_result: 1, // 1 = OK Passed
        wpc_no: "587",
        machine_time: 23.6,
        cycle_time: 35.12
      },
      process_results: [
        { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50032, value_numeric: 5.12 },
        { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50033, value_numeric: 92.4 },
        { process_operation_id: 123022, process_operation_result: 1, process_result_id: 50039, value_numeric: 4.95 },
        { process_operation_id: 123024, process_operation_result: 1, process_result_id: 50129, value_text: "VALEO-OK" }
      ]
    }, null, 2));
  };

  const handleLoadDegradedPreset = () => {
    setRawJson(JSON.stringify({
      product_context: {
        product_id: "MATERIAL-1",
        product_serial_no: "" // Missing Serial -> Triggers Degraded Mode Zero Data Loss
      },
      time_context: {
        timestamp: new Date().toISOString()
      },
      process_context: {
        station_id: "ST-UNMAPPED-999", // Unmapped station
        process_step_id: 0,
        station_mode: 0,
        process_step_result: 1
      },
      process_results: [
        { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50032, value_numeric: 4.85 }
      ]
    }, null, 2));
  };

  const handleLoadTorqueExceededPreset = () => {
    setRawJson(JSON.stringify({
      product_context: {
        product_id: "MATERIAL-1",
        product_serial_no: "SN-VALEO-DEFECT-2026-99"
      },
      time_context: {
        timestamp: new Date().toISOString()
      },
      process_context: {
        station_id: "ST060.1",
        process_step_id: 11001,
        station_mode: 0,
        process_step_result: 2, // 2 = NOK Defect
        failure_code: "ERR-TRQ-MAX",
        wpc_no: "587",
        machine_time: 28.4,
        cycle_time: 42.10
      },
      process_results: [
        { process_operation_id: 123021, process_operation_result: 2, process_result_id: 50032, value_numeric: 18.75 }, // Torque = 18.75 N·m (Exceeds USL 16.0 N·m)
        { process_operation_id: 123021, process_operation_result: 1, process_result_id: 50033, value_numeric: 91.2 }
      ]
    }, null, 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header SLA Card */}
      <div className="card">
        <div className="card-h">
          <div>
            <h2>PLC MACHINE CYCLE SIMULATOR & INSPECTOR (BUC-1/2)</h2>
            <div className="sub mono">
              Synchronous Handshake & Low-Latency SLA Enforcement Console
            </div>
          </div>

          {latencyMs !== null && (
            <span className={`pill ${latencyMs < 50 ? 'p-ok' : 'p-bad'} mono`} style={{ marginLeft: 'auto', fontSize: '11.5px', padding: '4px 10px' }}>
              Roundtrip SLA: {latencyMs} ms {latencyMs < 50 ? '(PASS <50ms)' : '(EXCEEDED)'}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
        {/* Left Card: Trigger Payload */}
        <div className="card">
          <div className="card-h">
            <h2>PLC MACHINE CYCLE TRIGGER</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={handleLoadNominalPreset} className="btn" title="Nominal Passed Cycle">
                Preset 1 (Nominal OK)
              </button>
              <button onClick={handleLoadDegradedPreset} className="btn" title="Degraded Mode Missing Context">
                Preset 2 (Degraded)
              </button>
              <button onClick={handleLoadTorqueExceededPreset} className="btn" style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }} title="Torque Limit Exceeded NOK">
                Preset 3 (Torque Exceeded)
              </button>
            </div>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <textarea
              value={rawJson}
              onChange={e => setRawJson(e.target.value)}
              rows={14}
              className="mono"
              style={{
                width: '100%',
                fontSize: '11px',
                padding: '10px',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--ink)',
                border: '1px solid var(--rule)',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={handleTriggerCycle}
              disabled={loading}
              className="btn primary"
              style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
            >
              {loading ? 'Transmitting...' : '🚀 Trigger PLC Machine Cycle Call (POST /api/v1/traceability/process-results)'}
            </button>
          </div>
        </div>

        {/* Right Card: API Response */}
        <div className="card">
          <div className="card-h">
            <h2>API FEEDBACK & RESPONSE</h2>
            <span className="pill p-ok mono" style={{ marginLeft: 'auto' }}>
              RFC 7807 LOG
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            {response ? (
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '5px', border: '1px solid var(--rule)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className={`pill ${response.status === 'SUCCESS' ? 'p-ok' : 'p-bad'} mono`}>
                    Status: {response.status}
                  </span>
                  <span className={`pill ${response.storage_mode === 'STANDARD' ? 'p-ok' : 'p-warn'} mono`}>
                    Mode: {response.storage_mode}
                  </span>
                </div>
                <pre className="mono" style={{ fontSize: '11px', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontStyle: 'italic', padding: '24px 0', textAlign: 'center' }}>
                Click "Trigger PLC Machine Cycle Call" to test API response latency and payload feedback.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspection Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Table 1: Recorded Process Results */}
        <div className="card">
          <div className="card-h">
            <h2>RECORDED PROCESS RESULTS (<code className="mono" style={{ fontSize: '11.5px' }}>jarvis_edge_db</code>)</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Station</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td className="id">{r.serialNumber}</td>
                  <td>{r.stationCode}</td>
                  <td>
                    <span className={`pill ${r.storageMode === 'STANDARD' ? 'p-ok' : 'p-warn'} mono`}>
                      {r.storageMode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Audit Logs */}
        <div className="card">
          <div className="card-h">
            <h2>AUDIT & DEGRADED SNAPSHOT LOGS</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Mode</th>
                <th className="num">Latency</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(a => (
                <tr key={a.id}>
                  <td className="mono">{new Date(a.createdAt).toLocaleTimeString()}</td>
                  <td>
                    <span className={`pill ${a.storageMode === 'STANDARD' ? 'p-ok' : 'p-warn'} mono`}>
                      {a.storageMode}
                    </span>
                  </td>
                  <td className="num">{a.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
