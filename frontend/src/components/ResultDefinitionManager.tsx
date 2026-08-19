import React, { useState, useEffect } from 'react';

interface ResultDefinition {
  id: string;
  operationId: string;
  resultCode: number;
  resultName: string;
  resultType: number;
  uom: string;
  nominal?: number;
  lsl?: number;
  usl?: number;
  isMandatory: boolean;
}

interface Operation {
  id: string;
  stepId: string;
  operationCode: number;
  operationName: string;
  resultDefinitions: ResultDefinition[];
}

interface Props {
  selectedStepId: string;
  stepName: string;
}

export const ResultDefinitionManager: React.FC<Props> = ({ selectedStepId, stepName }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [opCode, setOpCode] = useState<number>(123025);
  const [opName, setOpName] = useState('Screw 5');

  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [resCode, setResCode] = useState<number>(50130);
  const [resName, setResName] = useState('Depth');
  const [resType, setResType] = useState<number>(1);
  const [uom, setUom] = useState('MM');
  const [nominal, setNominal] = useState<number>(15);
  const [lsl, setLsl] = useState<number>(14);
  const [usl, setUsl] = useState<number>(16);

  const fetchOperations = async () => {
    if (!selectedStepId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-steps/${selectedStepId}/operations`);
      if (res.ok) {
        const data = await res.json();
        setOperations(data);
        if (data.length > 0 && !selectedOpId) {
          setSelectedOpId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching operations:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOperations();
  }, [selectedStepId]);

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-steps/${selectedStepId}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationCode: opCode, operationName: opName })
      });
      if (res.ok) {
        await fetchOperations();
      }
    } catch (err) {
      console.error('Error adding operation:', err);
    }
  };

  const handleAddResultDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-operations/${selectedOpId}/result-definitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultCode: resCode,
          resultName: resName,
          resultType: resType,
          uom,
          nominal,
          lsl,
          usl,
          isMandatory: true
        })
      });
      if (res.ok) {
        await fetchOperations();
      }
    } catch (err) {
      console.error('Error adding result definition:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155', marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
        ⚙️ BUC-0 Operations & Result Specifications for Step: {stepName}
      </h3>

      {/* Operations Form */}
      <form onSubmit={handleAddOperation} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="number"
          placeholder="Op Code"
          value={opCode}
          onChange={e => setOpCode(Number(e.target.value))}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', width: '100px' }}
        />
        <input
          type="text"
          placeholder="Operation Name (e.g. Screw 1)"
          value={opName}
          onChange={e => setOpName(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', flex: 1 }}
        />
        <button
          type="submit"
          style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Add Operation
        </button>
      </form>

      {/* Operations & Results Tables */}
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading operations...</p>
      ) : operations.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>No operations configured for this step yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {operations.map(op => (
            <div key={op.id} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>[{op.operationCode}] {op.operationName}</span>
                <button
                  onClick={() => setSelectedOpId(op.id)}
                  style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: op.id === selectedOpId ? '#0284c7' : '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {op.id === selectedOpId ? 'Selected for Result Definition' : 'Select'}
                </button>
              </div>

              {/* Result Definitions List */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '8px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Result ID</th>
                    <th style={{ padding: '6px' }}>Metric Name</th>
                    <th style={{ padding: '6px' }}>Type</th>
                    <th style={{ padding: '6px' }}>UOM</th>
                    <th style={{ padding: '6px' }}>Nominal</th>
                    <th style={{ padding: '6px' }}>LSL</th>
                    <th style={{ padding: '6px' }}>USL</th>
                    <th style={{ padding: '6px' }}>Mandatory</th>
                  </tr>
                </thead>
                <tbody>
                  {op.resultDefinitions && op.resultDefinitions.length > 0 ? (
                    op.resultDefinitions.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                        <td style={{ padding: '6px', fontWeight: 'bold' }}>[{r.resultCode}]</td>
                        <td style={{ padding: '6px' }}>{r.resultName}</td>
                        <td style={{ padding: '6px' }}>{r.resultType === 1 ? 'Numeric' : 'Text'}</td>
                        <td style={{ padding: '6px' }}>{r.uom}</td>
                        <td style={{ padding: '6px' }}>{r.nominal ?? '-'}</td>
                        <td style={{ padding: '6px', color: '#f87171' }}>{r.lsl ?? '-'}</td>
                        <td style={{ padding: '6px', color: '#4ade80' }}>{r.usl ?? '-'}</td>
                        <td style={{ padding: '6px' }}>{r.isMandatory ? 'Yes' : 'No'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '8px', color: '#64748b', textAlign: 'center' }}>No result metrics defined for this operation.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

          {/* Add Result Metric Form */}
          {selectedOpId && (
            <form onSubmit={handleAddResultDef} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px border #38bdf8', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <input type="number" placeholder="Result Code" value={resCode} onChange={e => setResCode(Number(e.target.value))} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="text" placeholder="Metric Name (e.g. Torque)" value={resName} onChange={e => setResName(e.target.value)} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="text" placeholder="UOM (e.g. NU, DD)" value={uom} onChange={e => setUom(e.target.value)} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="number" placeholder="Nominal" value={nominal} onChange={e => setNominal(Number(e.target.value))} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="number" placeholder="LSL" value={lsl} onChange={e => setLsl(Number(e.target.value))} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="number" placeholder="USL" value={usl} onChange={e => setUsl(Number(e.target.value))} style={{ padding: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <button type="submit" style={{ gridColumn: 'span 2', padding: '6px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Add Result Metric Specification
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
