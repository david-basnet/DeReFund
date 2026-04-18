import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, milestoneAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Flag, Loader2, Plus, Upload, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

const NGOMilestones = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.user_id || user?.id;
      if (!userId) return;

      try {
        setLoading(true);
        const campaignsResponse = await campaignAPI.getAll({ ngo_id: userId });
        const campaignsData =
          campaignsResponse.data?.campaigns ||
          campaignsResponse.data?.data?.campaigns ||
          campaignsResponse.data ||
          campaignsResponse.campaigns ||
          [];
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);

        const allMilestones = [];
        for (const campaign of campaignsArray) {
          try {
            const milestonesResponse = await milestoneAPI.getByCampaign(campaign.campaign_id);
            const milestonesData =
              milestonesResponse.data?.milestones ||
              milestonesResponse.data?.data?.milestones ||
              milestonesResponse.data ||
              milestonesResponse.milestones ||
              [];
            const milestonesArray = Array.isArray(milestonesData) ? milestonesData : [];
            const campaignMilestones = milestonesArray.map(m => ({
              ...m,
              campaign_title: campaign.title,
              campaign_id: campaign.campaign_id,
            }));
            allMilestones.push(...campaignMilestones);
          } catch (err) {
            console.error(`Error fetching milestones for campaign ${campaign.campaign_id}:`, err);
          }
        }

        setMilestones(allMilestones);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCampaigns([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredMilestones = selectedCampaign === 'ALL'
    ? milestones
    : milestones.filter(m => m.campaign_id === selectedCampaign);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-600';
      case 'SUBMITTED':
        return 'bg-yellow/20 text-yellow';
      default:
        return 'bg-gray text-black';
    }
  };

  if (!user || user.role !== 'NGO') {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Access Denied</h2>
            <p className="text-gray-800 tracking-tight">This page is only available for NGOs.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full bg-light-gray pt-32 pb-8 px-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple to-light-purple rounded-xl shadow-md">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-black tracking-tight leading-tight">Milestones</h1>
              </div>
              <p className="text-gray-800 tracking-tight ml-14">Manage milestones across all your campaigns</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-black mb-2 tracking-tight">
              Filter by Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black tracking-tight"
            >
              <option value="ALL">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-16 animate-fade-in">
              <Loader2 className="inline-block animate-spin h-16 w-16 text-purple mb-4" />
              <p className="text-gray-800 tracking-tight">Loading milestones...</p>
            </div>
          ) : filteredMilestones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-purple/10 rounded-2xl">
                  <Flag className="h-16 w-16 text-purple/30" />
                </div>
              </div>
              <p className="text-gray-800 mb-6 text-lg tracking-tight">No milestones found.</p>
              <Link
                to="/ngo/create-campaign"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-light-purple text-white px-8 py-4 rounded-xl font-bold hover-lift shadow-lg transition-all duration-300 tracking-tight"
              >
                <Plus className="h-5 w-5" />
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMilestones.map((milestone, index) => (
                <div 
                  key={milestone.milestone_id} 
                  className="bg-white rounded-2xl shadow-lg p-6 card-hover stagger-item animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple to-light-purple rounded-full flex items-center justify-center font-bold shadow-md">
                          <span className="text-white text-lg">{milestone.order_index || index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black tracking-tight leading-tight">{milestone.title}</h3>
                          <Link
                            to={`/campaigns/${milestone.campaign_id}`}
                            className="text-sm text-purple hover:text-light-purple underline-animate tracking-tight"
                          >
                            {milestone.campaign_title}
                          </Link>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-4 tracking-tight leading-relaxed">{milestone.description}</p>
                      <div className="flex items-center space-x-6 text-sm tracking-tight">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800">Amount to Release:</span>
                          <span className="font-bold text-black">
                            ${milestone.amount_to_release?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(milestone.status)}`}>
                            {getStatusIcon(milestone.status)}
                            {milestone.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {milestone.status === 'PENDING' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-md transition-all duration-300 text-sm font-bold tracking-tight">
                          <Upload className="h-4 w-4" />
                          Submit
                        </button>
                      )}
                      {milestone.status === 'SUBMITTED' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-dark-green to-dark-green/80 text-white rounded-xl hover-lift shadow-md transition-all duration-300 text-sm font-bold tracking-tight">
                          <Upload className="h-4 w-4" />
                          Upload Proof
                        </button>
                      )}
                      <Link
                        to={`/ngo/campaigns/${milestone.campaign_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray text-gray-800 rounded-xl hover:bg-gray-800 hover:text-white transition-all duration-300 text-sm font-bold tracking-tight text-center"
                      >
                        <Eye className="h-4 w-4" />
                        View Campaign
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NGOMilestones;
