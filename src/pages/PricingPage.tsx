import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PricingPage: React.FC = () => {
  const { user, updateUserPlan, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const handleUpgradeToPremium = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (user?.plan === 'premium') {
      return; // Already premium
    }

    try {
      setIsUpgrading(true);
      await updateUserPlan('premium');
      setUpgradeSuccess(true);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setUpgradeSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      alert('Failed to upgrade plan. Please try again.');    } finally {
      setIsUpgrading(false);
    }
  };const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 3 active listings',
        'Up to 3 auction listings',
        'Basic inquiry management',
        'Standard support',
        'Community access',
        'Basic analytics'
      ],
      limitations: [
        'Limited visibility in search results',
        'No premium badges',
        'Standard listing placement',
        'No nearby business discovery'
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Premium',
      price: '$15',
      period: 'per month',
      description: 'For growing businesses that need more visibility',
      features: [
        'Unlimited listings',
        'Unlimited auction listings', 
        'Nearby business discovery',
        'Priority in search results',
        'Premium business badge',
        'Advanced analytics',
        'Priority support',
        'Featured listing slots',
        'Bulk inquiry management',
        'Early access to new features'
      ],
      limitations: [],
      cta: 'Start Premium Trial',
      popular: true,
      color: 'primary'
    }
  ];
  const faqs = [
    {
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the next billing cycle for downgrades.'
    },
    {
      question: 'What happens to my listings if I downgrade?',
      answer: 'If you downgrade from Premium to Free, your listings will remain active but you\'ll lose premium features like priority placement and advanced analytics. Any listings beyond the 3-listing limit will be automatically archived.'
    },
    {
      question: 'What are the auction listing limits?',
      answer: 'Free users can create up to 3 auction listings at a time. Premium users have unlimited auction listings. This helps ensure auction quality while giving everyone a chance to participate.'
    },
    {
      question: 'How does nearby business discovery work?',
      answer: 'This premium feature uses Google Maps to help you find and connect with businesses near your location. It\'s perfect for discovering local suppliers, partners, and networking opportunities in your area.'
    },
    {
      question: 'Is there a long-term contract?',
      answer: 'No, all our plans are month-to-month with no long-term commitment. You can cancel anytime.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for Premium subscriptions. If you\'re not satisfied, we\'ll refund your payment.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. Start free and upgrade when you're ready to grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-4 items-stretch h-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 flex flex-col h-full p-8 ${
                plan.popular 
                  ? 'border-primary-500 transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="space-y-4 mb-8 flex-grow">
                  <h4 className="font-semibold text-gray-900">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>                <div className="mt-auto">
                  {plan.name === 'Premium' && plan.cta === 'Start Premium Trial' ? (
                    <button
                      onClick={handleUpgradeToPremium}
                      disabled={isUpgrading || user?.plan === 'premium'}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        user?.plan === 'premium'
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : isUpgrading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {user?.plan === 'premium' 
                        ? 'Current Plan' 
                        : isUpgrading 
                        ? 'Upgrading...' 
                        : plan.cta
                      }
                    </button>
                  ) : (
                    <Link
                      to="/signin"
                      className={`w-full block text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                  {plan.name === 'Premium' && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      30-day free trial
                    </p>
                  )}
                  {upgradeSuccess && plan.name === 'Premium' && (
                    <p className="text-center text-sm text-green-600 mt-2 font-medium">
                      ✅ Successfully upgraded to Premium!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mb-12 mt-8">
          Note: A 3% commission applies to every transaction.
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare All Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 text-gray-700">Active Listings</td>
                  <td className="py-4 px-6 text-center text-gray-700">3</td>
                  <td className="py-4 px-6 text-center text-gray-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Auction Listings</td>
                  <td className="py-4 px-6 text-center text-gray-700">3</td>
                  <td className="py-4 px-6 text-center text-gray-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Nearby Business Discovery</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Search Priority</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Premium Badge</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Advanced Analytics</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Priority Support</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">API Access</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of businesses already using HyperLocal to connect and grow.
            </p>
            <Link
              to="/signin"
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <Zap className="h-5 w-5" />
              <span>Start Free Today</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;