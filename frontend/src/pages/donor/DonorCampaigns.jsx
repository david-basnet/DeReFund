import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../utils/api';
import DonorLayout from '../../components/DonorLayout';
import { FileText, Search, Filter, Loader2, Image as ImageIcon, DollarSign, Users, Target, CheckCircle2, Clock } from 'lucide-react';

const DonorCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getAll({ status: filter !== 'ALL' ? filter : null });
      const campaignsData = Array.isArray(response.data?.campaigns) 
        ? response.data.campaigns 
        : [];
      
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      LIVE: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Live' },
      PENDING_VERIFICATION: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending Verification' },
      PENDING_ADMIN_APPROVAL: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Pending Approval' },
      VERIFIED_BY_VOLUNTEERS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle2, label: 'Verified' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle2, label: 'Completed' },
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText, label: status };
    const Icon = statusInfo.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text} font-dmsans tracking-tight`}>
        <Icon className="w-3 h-3" />
        <span>{statusInfo.label}</span>
      </div>
    );
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2 font-playfair tracking-tight">Browse Campaigns</h1>
            <p className="text-gray-700 font-dmsans tracking-tight">Discover campaigns that need your support</p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-dmsans tracking-tight transition-all"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-dmsans tracking-tight font-semibold cursor-pointer transition-all"
                >
                  <option value="ALL">All Status</option>
                  <option value="LIVE">Live</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="VERIFIED_BY_VOLUNTEERS">Verified</option>
                  <option value="PENDING_ADMIN_APPROVAL">Pending Approval</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaigns Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-dmsans tracking-tight">Loading campaigns...</p>
              </div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 font-playfair tracking-tight">
                {searchTerm ? 'No campaigns found' : 'No campaigns available'}
              </h3>
              <p className="text-gray-700 font-dmsans tracking-tight">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'There are no campaigns available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const progressPercentage = campaign.target_amount > 0 
                  ? ((campaign.current_amount || 0) / campaign.target_amount) * 100 
                  : 0;
                
                return (
                  <div
                    key={campaign.campaign_id}
                    className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Campaign Image */}
                    <div className="mb-4">
                      {campaign.images && campaign.images[0] ? (
                        <img
                          src={campaign.images[0]}
                          alt={campaign.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-blue-50 rounded-lg mb-4 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-blue-300" />
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-black mb-2 line-clamp-2 font-playfair tracking-tight">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3 font-dmsans tracking-tight">
                        {campaign.description}
                      </p>
                      {getStatusBadge(campaign.status)}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2 font-dmsans tracking-tight">
                        <span className="text-blue-600 font-bold">
                          ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-600">
                          ${campaign.target_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-dmsans tracking-tight">
                        {Math.round(progressPercentage)}% funded
                      </p>
                    </div>

                    {/* Campaign Info */}
                    <div className="flex items-center justify-between text-sm mb-4 font-dmsans tracking-tight">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{campaign.ngo_name || 'NGO'}</span>
                      </div>
                      {campaign.disaster_title && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[100px]">{campaign.disaster_title}</span>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <Link
                      to={`/campaigns/${campaign.campaign_id}`}
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold font-dmsans tracking-tight shadow-sm hover:shadow-md"
                    >
                      View Campaign
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DonorLayout>
  );
};

export default DonorCampaigns;

