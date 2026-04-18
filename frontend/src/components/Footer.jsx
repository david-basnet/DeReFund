import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Shield, Award, Star } from 'lucide-react';
import { assets } from '../assets/assets';

const Footer = () => {

  return (
    <footer
      className="relative z-10 block w-full text-white"
      style={{
        background: 'linear-gradient(135deg, #001a38 0%, #002455 55%, #0a3d6b 100%)',
        display: 'block',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - Company Info & Contact */}
          <div>
            <div className="mb-4">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">DISASTER RELIEF PLATFORM</p>
              <img
                src={assets.logo}
                alt="DeReFund"
                className="h-10 w-auto max-w-[220px] object-left object-contain sm:h-11"
                width={220}
                height={44}
              />
            </div>
            <div className="mb-6">
              <p className="text-white/90 text-sm tracking-tight mb-4">
                Transparent, blockchain-verified disaster relief donations. Every contribution is tracked, every impact is verified.
              </p>
              <div className="flex items-center gap-2 text-sm tracking-tight mb-2">
                <MapPin className="h-4 w-4" />
                <span>Global Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm tracking-tight mb-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@derefund.org" className="hover:underline">contact@derefund.org</a>
              </div>
              <div className="flex items-center gap-2 text-sm tracking-tight">
                <Phone className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider mb-3 ">CONTACT</p>
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
            <h4 className="text-lg font-bold uppercase tracking-wider mb-6 ">SERVICES</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/campaigns" className="text-white/90 hover:text-white transition-colors text-sm tracking-tight">
                  Live Campaigns
                </Link>
              </li>
              <li>
                <Link to="/disasters" className="text-white/90 hover:text-white transition-colors text-sm tracking-tight">
                  Disaster Reports
                </Link>
              </li>
              <li>
                <Link to="/volunteer/voting" className="text-white/90 hover:text-white transition-colors text-sm tracking-tight">
                  Volunteer Verification
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/90 hover:text-white transition-colors text-sm tracking-tight">
                  About Us
                </Link>
              </li>
              <li>
                <span className="text-white/90 text-sm tracking-tight">Blockchain Tracking</span>
              </li>
              <li>
                <span className="text-white/90 text-sm tracking-tight">Milestone Verification</span>
              </li>
              <li>
                <span className="text-white/90 text-sm tracking-tight">Transparent Donations</span>
              </li>
              <li>
                <span className="text-white/90 text-sm tracking-tight">NGO Verification</span>
              </li>
            </ul>
          </div>

          {/* Column 3 - Sectors & Platforms */}
          <div>
            <div className="mb-8">
              <h4 className="text-lg font-bold uppercase tracking-wider mb-6 ">SECTORS</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Natural Disasters</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Emergency Relief</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Medical Aid</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Rebuilding Communities</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase tracking-wider mb-6 ">PLATFORMS</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Blockchain Verified</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Polygon Network</span>
                </li>
                <li>
                  <span className="text-white/90 text-sm tracking-tight">Smart Contract Escrow</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4 - Reviews */}
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-bold uppercase tracking-wider mb-4 ">REVIEWS</h4>
              <p className="text-white/90 text-sm tracking-tight mb-3">
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
                    <p className="text-xs font-bold uppercase tracking-wider ">SECURITY</p>
                    <p className="text-xs text-white/90 tracking-tight">Verified Platform</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-8 w-8 text-yellow" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider ">TRANSPARENCY</p>
                    <p className="text-xs text-white/90 tracking-tight">100% Trackable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm tracking-tight">
              © 2024 DeReFund. All rights reserved. Transparent disaster relief through blockchain technology.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-white/80 hover:text-white text-sm tracking-tight transition-colors">
                Privacy Policy
              </Link>
              <Link to="/about" className="text-white/80 hover:text-white text-sm tracking-tight transition-colors">
                Terms of Service
              </Link>
              <button className="text-white/80 hover:text-white text-sm tracking-tight transition-colors">
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

