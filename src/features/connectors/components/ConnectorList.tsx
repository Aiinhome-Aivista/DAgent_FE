import { Connector } from '../types';
import { ConnectorCard } from './ConnectorCard';
import { Input } from '@/src/ui-kit';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useConnectorContext } from '../../../context/ConnectorContext';
import { SUPPORTED_CONNECTORS } from '../constants';
import { apiService } from '@/src/services/api.service';
import { API_ENDPOINTS } from '@/src/services/api.config';

interface ConnectorListProps {
  onSelect?: (connector: any) => void;
}

export const ConnectorList = ({ onSelect }: ConnectorListProps = {}) => {
  const [search, setSearch] = useState('');
  const [allowedConnectors, setAllowedConnectors] = useState<string>('');
  const { setSelectedConnector } = useConnectorContext();

  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        const userId = localStorage.getItem('DAgent_user_id') || '1';
        const response = await apiService.get(`${API_ENDPOINTS.USER.USAGE_STATS}?user_id=${userId}`) as any;
        if (response && response.usage_stats) {
          setAllowedConnectors(response.usage_stats.allowed_connectors || '');
        }
      } catch (err) {
        console.error('Failed to load usage stats for connectors', err);
      }
    };
    fetchUsageStats();
  }, []);

  const checkConnectorAllowed = (connectorName: string, allowedStr: string) => {
    const allowed = allowedStr.toLowerCase();
    const name = connectorName.toLowerCase();
    if (!allowedStr) return true; // fallback if no plan string
    if (name.includes('upload') || name.includes('document')) return allowed.includes('file upload');
    if (name.includes('mysql')) return allowed.includes('mysql');
    if (name.includes('postgres')) return allowed.includes('postgres');
    if (name.includes('web search')) return allowed.includes('llm search') || allowed.includes('web search');
    if (name.includes('snowflake')) return allowed.includes('snowflake');
    return allowed.includes(name);
  };

  const filtered = SUPPORTED_CONNECTORS.map(c => {
    const isAllowed = checkConnectorAllowed(c.name, allowedConnectors);
    return {
      ...c,
      disabled: c.disabled || !isAllowed,
      isPlanRestricted: !c.disabled && !isAllowed // flag to show "Upgrade Plan" instead of "Coming Soon"
    };
  }).filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex flex-col md:flex-row gap-3 items-end justify-end">
        <div className="w-full md:max-w-xs">
          <Input 
         
            placeholder="Search by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <div className="relative -top-8 left-3 w-4 h-4 text-[var(--text-secondary)]">
            <Search className="w-4 h-4" />
          </div>
        </div>
        
        {/* <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium hover:bg-[var(--surface-hover)] transition-colors">
            <Filter className="w-3 h-3" />
            Filter
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((connector) => (
          <ConnectorCard 
            key={connector.id} 
            connector={connector as any} 
            onClick={() => {
              setSelectedConnector(connector as any);
              onSelect?.(connector as any);
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-[var(--text-secondary)]">No connectors found matching your search.</p>
        </div>
      )}
    </div>
  );
};
