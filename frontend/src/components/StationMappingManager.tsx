import React, { useState, useEffect } from 'react';

interface StationMapping {
  id: string;
  lineCode: string;
  stationCode: string;
  stepId: string;
}

interface DeploymentResult {
  flowId: string;
  productId: string;
  flowCode: string;
  syncStatus: string;
  deployedAt: string;
  stationsCount: number;
  message: string;
}

interface Props {
  selectedFlowId: string;
  selectedStepId: string;
  stepName: string;
  flowCode: string;
}

export const StationMappingManager: React.FC<Props> = ({ selectedFlowId, selectedStepId, stepName, flowCode }) => {
  const [mappings, setMappings] = useState<StationMapping[]>([]);
  const [lineCode, setLineCode] = useState('LINE-1');
  const [stationCode, setStationCode] = useState('ST060.1');
  const [deployResult, setDeployResult] = useState<DeploymentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMappings = async () => {
    if (!selectedStepId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-steps/${selectedStepId}/station-mappings`);
      if (res.ok) {
        const data = await res.json();
        setMappings(data);
      }
    } catch (err) {
      console.error('Error fetching station mappings:', err);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [selectedStepId]);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStepId || !stationCode) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-steps/${selectedStepId}/station-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineCode, stationCode })
      });
      if (res.ok) {
        await fetchMappings();
      }
    } catch (err) {
      console.error('Error adding station mapping:', err);
    }
  };

  const handleDeployToEdge = async () => {
    if (!selectedFlowId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/process-flows/${selectedFlowId}/deploy`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setDeployResult(data);
      }
    } catch (err) {
      console.error('Error deploying to Edge PC:', err);
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8' }}>
            📍 Station Assignment & Site-to-Edge PC Deployment (BUC-0)
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Assign physical stations to step: {stepName}</p>
        </div>

        {/* Deploy to Edge PC Action Button */}
        <button
          onClick={handleDeployToEdge}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? 'Deploying...' : '🚀 Deploy Flow to Line Edge PC'}
        </button>
      </div>

      {deployResult && (
        <div style={{ padding: '12px 16px', backgroundColor: '#064e3b', borderLeft: '4px solid #10b981', color: '#ecfdf5', marginBottom: '16px', borderRadius: '4px' }}>
          <strong>✅ Deployment Verified:</strong> {deployResult.message}
          <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '4px' }}>
            Status: <span style={{ fontWeight: 'bold', color: '#34d399' }}>{deployResult.syncStatus}</span> | Mapped Stations: {deployResult.stationsCount} | Time: {new Date(deployResult.deployedAt).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Add Station Mapping Form */}
      <form onSubmit={handleAddMapping} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Line Code (e.g. LINE-1)"
          value={lineCode}
          onChange={e => setLineCode(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', width: '120px' }}
        />
        <input
          type="text"
          placeholder="Station Code (e.g. ST060.1, ST070)"
          value={stationCode}
          onChange={e => setStationCode(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', flex: 1 }}
        />
        <button
          type="submit"
          style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Assign Station
        </button>
      </form>

      {/* Assigned Stations List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {mappings && mappings.length > 0 ? (
          mappings.map(m => (
            <div key={m.id} style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{m.lineCode}</span>
              <span>→</span>
              <span style={{ fontWeight: 'bold' }}>{m.stationCode}</span>
            </div>
          ))
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No physical line stations assigned to this step yet.</p>
        )}
      </div>
    </div>
  );
};
