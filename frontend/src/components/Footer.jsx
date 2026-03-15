import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Shield, Award, Star } from 'lucide-react';

const Footer = () => {

  return (
    <footer className="text-white w-full relative z-10 block" style={{ background: 'linear-gradient(135deg, #050E3C 0%, #002455 50%, #002455 100%)', display: 'block' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - Company Info & Contact */}
          <div>
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider mb-2 font-dmsans">DISASTER RELIEF PLATFORM</p>
              <h3 className="text-3xl font-bold font-playfair tracking-tight">DeReFund</h3>
            </div>
            <div className="mb-6">
              <p className="text-white/90 text-sm font-dmsans tracking-tight mb-4">
                Transparent, blockchain-verified disaster relief donations. Every contribution is tracked, every impact is verified.
              </p>
              <div className="flex items-center gap-2 text-sm font-dmsans tracking-tight mb-2">
                <MapPin className="h-4 w-4" />
                <span>Global Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-dmsans tracking-tight mb-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@derefund.org" className="hover:underline">contact@derefund.org</a>
              </div>
              <div className="flex items-center gap-2 text-sm font-dmsans tracking-tight">
                <Phone className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider mb-3 font-dmsans">CONTACT</p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider mb-6 font-dmsans">SERVICES</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/campaigns" className="text-white/90 hover:text-white transition-colors text-sm font-dmsans tracking-tight">
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link to="/disasters" className="text-white/90 hover:text-white transition-colors text-sm font-dmsans tracking-tight">
                  Disaster Reports
                </Link>
              </li>
              <li>
                <Link to="/donor/verify" className="text-white/90 hover:text-white transition-colors text-sm font-dmsans tracking-tight">
                  Volunteer Verification
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/90 hover:text-white transition-colors text-sm font-dmsans tracking-tight">
                  About Us
                </Link>
              </li>
              <li>
                <span className="text-white/90 text-sm font-dmsans tracking-tight">Blockchain Tracking</span>
              </li>
              <li>
                <span className="text-white/90 text-sm font-dmsans tracking-tight">Milestone Verification</span>
              </li>
              <li>
                <span className="text-white/90 text-sm font-dmsans tracking-tight">Transparent Donations</span>
              </li>
              <li>
                <span className="text-white/90 text-sm font-dmsans tracking-tight">NGO Verification</span>
              </li>
            </ul>
          </div>

          {/* Column 3 - Sectors & Platforms */}
          <div>
            <div className="mb-8">
              <h4 className="text-lg font-bold uppercase tracking-wider mb-6 font-dmsans">SECTORS</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Natural Disasters</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Emergency Relief</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Medical Aid</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Rebuilding Communities</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase tracking-wider mb-6 font-dmsans">PLATFORMS</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Blockchain Verified</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Polygon Network</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm font-dmsans tracking-tight">Smart Contract Escrow</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4 - Reviews */}
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-bold uppercase tracking-wider mb-4 font-dmsans">REVIEWS</h4>
              <p className="text-white/90 text-sm font-dmsans tracking-tight mb-3">
                Our users trust our transparent platform: Read our 5 Star reviews. (50+ reviews)
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow text-yellow" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-white" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider font-dmsans">SECURITY</p>
                    <p className="text-xs text-white/90 font-dmsans tracking-tight">Verified Platform</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-8 w-8 text-yellow" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider font-dmsans">TRANSPARENCY</p>
                    <p className="text-xs text-white/90 font-dmsans tracking-tight">100% Trackable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm font-dmsans tracking-tight">
              © 2024 DeReFund. All rights reserved. Transparent disaster relief through blockchain technology.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-white/80 hover:text-white text-sm font-dmsans tracking-tight transition-colors">
                Privacy Policy
              </Link>
              <Link to="/about" className="text-white/80 hover:text-white text-sm font-dmsans tracking-tight transition-colors">
                Terms of Service
              </Link>
              <button className="text-white/80 hover:text-white text-sm font-dmsans tracking-tight transition-colors">
                Cookie Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

