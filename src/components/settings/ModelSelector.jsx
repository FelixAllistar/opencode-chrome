import { MODELS } from '../../utils/constants.js';

export const ModelSelector = ({ selectedModel, onChange }) => (
  <select
    value={selectedModel.id}
    onChange={e => onChange(e.target.value)}
    className="border p-2 mb-4"
  >
    {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
  </select>
);