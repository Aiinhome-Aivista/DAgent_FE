import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Check, Twitter, Github, Linkedin, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/src/ui-kit';
import { TwitterIcon } from 'lucide-react';
import { defaultConfig } from '@/src/services/api.config';

interface PricingPlan {
  id: number;
  plan_name: string;
  data_storage: number;
  uploads: number;
  insights_queries: number;
  basic_features: string;
  download_allowed: string;
  number_of_users: number;
  custom_kpi: string;
  scheduled_email: string;
  audit_memory?: string;
  connectors?: string;
}

interface PricingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onBackToLanding: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted, onLogin, onBackToLanding }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch(`${defaultConfig.baseUrl}/api/pricing`);
        const data = await response.json();
        if (data.status === 'success') {
          setPlans(data.pricing);
        } else {
          setError(data.message || 'Failed to fetch pricing');
        }
      } catch (err) {
        setError('Error fetching pricing data');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  return (
    <div className="theme-landing min-h-screen bg-white text-slate-900 font-sans selection:bg-accent/10 selection:text-accent">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">DAgent</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <button onClick={onBackToLanding} className="hover:text-accent transition-colors">Features</button>
              <button onClick={onBackToLanding} className="hover:text-accent transition-colors">Use Cases</button>
              <button onClick={onBackToLanding} className="hover:text-accent transition-colors">Security</button>
              <button className="text-accent transition-colors">Pricing</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={onLogin}
                className="text-sm font-medium text-slate-600 hover:text-accent transition-colors"
              >
                Log in
              </button>
              <Button
                onClick={onGetStarted}
                className="bg-accent hover:bg-accent-hover text-white rounded-full px-6"
              >
                Sign Up
              </Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4"
          >
            <button onClick={onBackToLanding} className="block text-lg font-medium w-full text-left">Features</button>
            <button onClick={onBackToLanding} className="block text-lg font-medium w-full text-left">Use Cases</button>
            <button onClick={onBackToLanding} className="block text-lg font-medium w-full text-left">Security</button>
            <button className="block text-lg font-medium w-full text-left text-accent">Pricing</button>
            <div className="pt-4 flex flex-col gap-3">
              <Button variant="outline" onClick={onLogin} className="w-full">Log in</Button>
              <Button onClick={onGetStarted} className="w-full bg-accent text-white">Sign Up</Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Pricing Header */}
      <section className="pt-32 pb-10 px-4 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
          Pricing Plans
        </h1>
        <p className="text-lg text-slate-600">
          Choose the perfect plan to scale your data-driven workflows.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isPopular = plan.plan_name.toLowerCase().includes('silver');
              return (
                <div
                  key={plan.id}
                  className={`${isPopular ? 'border-2 border-accent shadow-md relative' : 'border border-slate-200 shadow-sm'} rounded-3xl p-8 bg-white flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{plan.plan_name} Plan</h3>
                  <div className="text-4xl font-extrabold mb-4 text-slate-900">
                    {plan.plan_name.toLowerCase() === 'free' ? 'Free' : plan.plan_name.toLowerCase() === 'gold' ? 'Contact Us' : '\u00A0'}
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.data_storage > 0 ? (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Up to {plan.data_storage} GB Data Storage</span></li>
                    ) : (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Unlimited Data Storage</span></li>
                    )}

                    {plan.uploads > 0 ? (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">{plan.uploads} uploads per day</span></li>
                    ) : plan.plan_name.toLowerCase() === 'silver' ? (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Multiple uploads</span></li>
                    ) : (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Unlimited uploads</span></li>
                    )}

                    {plan.insights_queries > 0 ? (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">{plan.insights_queries} Insights / Queries {plan.plan_name.toLowerCase() === 'free' ? 'per day' : ''}</span></li>
                    ) : (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Unlimited Insights / Queries</span></li>
                    )}

                    {plan.number_of_users > 0 ? (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">{plan.number_of_users === 1 ? '1 User' : `Up to ${plan.number_of_users} Users`}</span></li>
                    ) : (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Unlimited Users</span></li>
                    )}

                    {plan.download_allowed === 'Allowed' && (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Download Allowed</span></li>
                    )}

                    {plan.custom_kpi === 'Available' && (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Custom KPI</span></li>
                    )}

                    {plan.scheduled_email === 'Available' && (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">Scheduled Email</span></li>
                    )}

                    {plan.audit_memory && (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">{plan.audit_memory} audit memory</span></li>
                    )}

                    {plan.connectors && (
                      <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span className="text-slate-600 text-sm">{plan.connectors}</span></li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Simple Contact Link under Pricing Grid */}
        {!loading && !error && (
          <div className="mt-12 text-center text-slate-600 text-lg">
            For any queries, please contact us at <a href="mailto:support@dagent.ai" className="text-accent font-semibold hover:underline">support@dagent.ai</a>
          </div>
        )}
      </section>


      {/* Footer */}
      <footer className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">DAgent</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              Early stage AI lab based in San Francisco with a mission to build the most powerful AI tools for knowledge workers.
            </p>
            <div className="flex gap-4 text-slate-400">
              <Twitter className="w-5 h-5 cursor-pointer hover:text-accent" />
              <Github className="w-5 h-5 cursor-pointer hover:text-accent" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-accent" />
              <TwitterIcon className="w-5 h-5 cursor-pointer hover:text-accent" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Company</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="hover:text-accent cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Affiliate Program</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Terms & Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Product</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="text-accent cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Connectors</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Slack Agent</li>
              <li className="hover:text-accent cursor-pointer transition-colors">DAgent for Labs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="hover:text-accent cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Community</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Capabilities</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2025 DAgent Labs, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
