import { useState } from 'react';
import { Input, Button } from '@/src/ui-kit';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { ConnectorFormData } from '@/src/types/connector';

interface DatabaseFormProps {
  formData: ConnectorFormData;
  setFormData: (data: ConnectorFormData) => void;
  handleFocus: (field: string) => void;
  handleMouseEnter: (field: string) => void;
  handleTestConnection: () => void;
  isTesting: boolean;
  onBack: () => void;
  isPostgreSQL?: boolean;
}

export const DatabaseForm = ({
  formData,
  setFormData,
  handleFocus,
  handleMouseEnter,
  handleTestConnection,
  isTesting,
  onBack,
  isPostgreSQL
}: DatabaseFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.host?.trim()) newErrors.host = "Host is required";
    if (!formData.port?.toString().trim()) newErrors.port = "Port is required";
    if (!formData.database?.trim()) newErrors.database = "Database name is required";
    if (!formData.username?.trim()) newErrors.username = "Username is required";
    if (!formData.password?.trim()) newErrors.password = "Password is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    handleTestConnection();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onMouseEnter={() => handleMouseEnter('host')}>
          <Input
            label="Host / IP Address"
            placeholder="db.example.com"
            value={formData.host}
            onChange={(e) => {
              setFormData({ ...formData, host: e.target.value });
              if (errors.host) setErrors(prev => ({ ...prev, host: '' }));
            }}
            onFocus={() => handleFocus('host')}
            error={errors.host}
            required
          />
        </div>

        <div onMouseEnter={() => handleMouseEnter('port')}>
          <Input
            label="Port"
            placeholder="5432"
            value={formData.port}
            onChange={(e) => {
              setFormData({ ...formData, port: e.target.value });
              if (errors.port) setErrors(prev => ({ ...prev, port: '' }));
            }}
            onFocus={() => handleFocus('port')}
            error={errors.port}
            required
          />
        </div>

        <div onMouseEnter={() => handleMouseEnter('database')}>
          <Input
            label="Database Name"
            placeholder="main_db"
            value={formData.database}
            onChange={(e) => {
              setFormData({ ...formData, database: e.target.value });
              if (errors.database) setErrors(prev => ({ ...prev, database: '' }));
            }}
            onFocus={() => handleFocus('database')}
            error={errors.database}
            required
          />
        </div>

        {isPostgreSQL && (
          <div onMouseEnter={() => handleMouseEnter('schema')}>
            <Input
              label="Schema (Optional)"
              placeholder="public"
              value={formData.schema || ''}
              onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
              onFocus={() => handleFocus('schema')}
            />
          </div>
        )}


        <div onMouseEnter={() => handleMouseEnter('username')}>
          <Input
            label="Username"
            placeholder="readonly_user"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
            }}
            onFocus={() => handleFocus('username')}
            error={errors.username}
            required
          />
        </div>

        <div
          onMouseEnter={() => handleMouseEnter('password')}
          className="md:col-span-2"
        >
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            onFocus={() => handleFocus('password')}
            error={errors.password}
            required
            endIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={onBack} disabled={isTesting}>Cancel</Button>
        <Button
          className="px-8"
          onClick={validateAndSubmit}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : 'Connect to Data source'}
        </Button>
      </div>
    </div>
  );
};
