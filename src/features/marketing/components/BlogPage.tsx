import React, { useState } from 'react';
import { Twitter, Github, Linkedin, Search, ArrowLeft, Facebook } from 'lucide-react';

interface BlogPageProps {
  onBackToLanding: () => void;
  onPricingClick?: () => void;
}

const MOCK_BLOGS = [
  {
    id: 1,
    title: 'How Autonomous Agents Are Reshaping the Modern Workspace',
    description: 'Discover how AI-driven autonomous agents are automating complex workflows, giving your team more time to focus on strategic initiatives...',
    content: `The modern workspace is undergoing a massive transformation. As AI evolves, we are moving beyond simple chatbots to autonomous agents that can execute complex, multi-step workflows.\n\nAt DAgent, we believe the future of work is not just about making humans faster, but about automating the mundane tasks entirely. Autonomous agents can now analyze data, connect to databases, and even generate reports with minimal human intervention.\n\nImagine a world where your AI assistant doesn't just answer questions, but proactively monitors your data streams and alerts you when significant anomalies occur. This is the promise of autonomous AI agents. By integrating deeply with your existing tools, they act as true digital coworkers.\n\nAre you ready for the revolution? Start by identifying the most repetitive data tasks in your organization and see how DAgent can automate them.`,
    category: 'AI TRENDS',
    author: 'Subhajit Maity',
    date: 'Sep 25, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Building an Effective Knowledge Base for DAgent',
    description: 'Learn the best practices for structuring your organizational data to maximize the analytical capabilities of your AI agents...',
    content: `To get the most out of DAgent, your underlying data needs to be structured and accessible. Building an effective knowledge base is the foundation of any successful AI implementation.\n\nFirst, ensure your databases have clear schema definitions and consistent naming conventions. When tables and columns are descriptively named, DAgent's natural language engine can more accurately translate user questions into SQL queries.\n\nSecond, consolidate your documentation. If your team relies on spreadsheets, Notion pages, and scattered PDFs, consider unifying them or ensuring DAgent has access to all these sources. \n\nFinally, regularly audit your data sources for accuracy. An AI is only as good as the data it processes. By maintaining a clean knowledge base, you empower DAgent to deliver precise, actionable insights.`,
    category: 'BEST PRACTICES',
    author: 'Subhajit Maity',
    date: 'Sep 22, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Data Security in the Era of Enterprise AI',
    description: 'A deep dive into DAgent\'s enterprise-grade security architecture, compliance standards, and how we protect your sensitive data...',
    content: `As AI systems gain access to more organizational data, security becomes paramount. At DAgent, we understand that your data is your most valuable asset.\n\nOur platform is built on a foundation of enterprise-grade security. We employ end-to-end encryption, strict role-based access controls (RBAC), and continuous monitoring to ensure your data remains safe.\n\nFurthermore, DAgent operates on a strict 'read-only' principle. We connect to your data sources to extract insights, but we never alter or delete your original data. We are also fully compliant with SOC 2 Type II and GDPR standards.\n\nWhen deploying AI in your enterprise, never compromise on security. With DAgent, you get the power of advanced AI analytics with the peace of mind that your data is protected by industry-leading security protocols.`,
    category: 'SECURITY',
    author: 'Subhajit Maity',
    date: 'Sep 18, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ onBackToLanding, onPricingClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  const selectedBlog = MOCK_BLOGS.find(b => b.id === selectedBlogId);

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans selection:bg-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="font-bold tracking-tight text-slate-900">DAgent</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
             <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={onBackToLanding}>Features</span>
             <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={onBackToLanding}>Use Cases</span>
             <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={onBackToLanding}>Security</span>
             <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={onPricingClick}>Pricing</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Log in
            </button>
            <button className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {selectedBlog ? (
        <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 bg-white mt-12 rounded-lg shadow-sm border border-slate-100 mb-20">
          <button 
            onClick={() => setSelectedBlogId(null)} 
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </button>
          
          <div className="mb-8">
            <div className="text-xs font-bold text-accent mb-4 uppercase tracking-wide">
              {selectedBlog.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {selectedBlog.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-slate-100 py-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-800">By {selectedBlog.author}</span>
                <span className="hidden sm:inline">•</span>
                <span>{selectedBlog.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 mr-2">Share</span>
                <button className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1DA1F2] transition-colors"><Twitter className="w-4 h-4" /></button>
                <button className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-[#0A66C2] transition-colors"><Linkedin className="w-4 h-4" /></button>
                <button className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1877F2] transition-colors"><Facebook className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="w-full h-[300px] md:h-[450px] bg-slate-100 rounded-xl overflow-hidden mb-12">
            <img 
              src={selectedBlog.imageUrl} 
              alt={selectedBlog.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none prose-slate text-justify">
            {selectedBlog.content.split('\\n\\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6 text-slate-700 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-12 md:py-20 bg-white mt-12 rounded-lg shadow-sm border border-slate-100 mb-20">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-3xl md:text-[32px] font-normal text-slate-800 mb-3">
                Blogs For You
              </h1>
              <p className="text-slate-500 max-w-xl text-sm md:text-[15px]">
                Explore the latest insights, best practices, and updates on AI data analysis and autonomous agents.
              </p>
            </div>
            
            <div className="relative w-full md:w-96 mt-4 md:mt-0">
              <input 
                type="text" 
                placeholder="Search blogs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-[10px] rounded border border-slate-200 text-sm focus:outline-none focus:border-slate-300 placeholder:text-slate-400"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {MOCK_BLOGS.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).map((blog) => (
              <article key={blog.id} className="bg-white rounded overflow-hidden flex flex-col border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                {/* Image Container with light grey background */}
                <div className="bg-[#f0f2f5] p-5 pb-0 flex items-end justify-center h-[220px]">
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover rounded-t shadow-sm"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-[11px] font-bold text-accent mb-4 uppercase tracking-wide">
                    {blog.category}
                  </div>
                  
                  <h2 className="text-[20px] font-normal text-slate-800 mb-3 leading-snug">
                    {blog.title}
                  </h2>
                  
                  <div className="text-[12px] text-slate-400 italic mb-4 font-serif">
                    Leave a Comment / {blog.category} / {blog.author}
                  </div>
                  
                  <p className="text-[14px] text-slate-500 mb-8 leading-relaxed text-justify">
                    {blog.description}
                  </p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => setSelectedBlogId(blog.id)}
                      className="w-full py-3 bg-accent hover:opacity-90 text-white font-medium text-sm transition-opacity rounded-sm"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-50 border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8">
          <div className="lg:w-1/3 flex flex-col items-start space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">DAgent</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-4 text-opacity-50">Connect with us</p>
              <div className="flex gap-4 text-slate-400">
                <Twitter className="w-5 h-5 cursor-not-allowed opacity-50" />
                <Github className="w-5 h-5 cursor-not-allowed opacity-50" />
                <Linkedin className="w-5 h-5 cursor-not-allowed opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-sm mb-6 text-slate-900">Company</h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li><a href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-and-conditions" className="hover:text-accent transition-colors">Terms & Conditions</a></li>
                <li><a href="mailto:syed.arshad@aiinhome.com" className="hover:text-accent transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-6 text-slate-900">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li><a href="#" onClick={(e) => { e.preventDefault(); onPricingClick?.(); }} className="hover:text-accent transition-colors">Pricing</a></li>
                <li><a href="/blogs" className="text-accent transition-colors">Blogs</a></li>
                <li><a href="/help-center" className="hover:text-accent transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200/60 text-center">
          <p className="text-sm text-slate-500">© 2026 DAgent Labs, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
