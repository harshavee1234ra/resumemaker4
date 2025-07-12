import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Shield, ArrowRight } from 'lucide-react';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing';

interface PricingProps {
  onNavigate: (view: View) => void;
}

interface PricingPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  popular: boolean;
  icon: React.ElementType;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  color: string;
}

const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      icon: Shield,
      description: 'Perfect for getting started with basic resume building',
      features: [
        '3 basic templates',
        'Basic resume builder',
        'PDF export',
        'Basic ATS check',
        'Email support'
      ],
      limitations: [
        'Limited to 2 resumes',
        'Basic templates only',
        'Standard support'
      ],
      cta: 'Get Started Free',
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      popular: true,
      icon: Zap,
      description: 'Ideal for serious job seekers who want the best tools',
      features: [
        'Unlimited premium templates',
        'AI-powered content generation',
        'Advanced ATS optimization',
        'Keyword optimization',
        'Multiple export formats (PDF, DOCX)',
        'Cover letter generator',
        'Real-time collaboration',
        'Analytics dashboard',
        'Priority support',
        'Custom branding'
      ],
      cta: 'Start Pro Trial',
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      popular: false,
      icon: Crown,
      description: 'For teams and organizations with advanced needs',
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'Custom template creation',
        'API access',
        'SSO integration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const faqs = [
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
    },
    {
      question: 'Is there a free trial for Pro plans?',
      answer: 'Yes, we offer a 14-day free trial for our Pro plan. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes, we offer a 50% discount for students with valid student email addresses.'
    }
  ];

  const getPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.price.monthly === 0) return 0;
    const yearlyMonthly = plan.price.yearly / 12;
    const savings = ((plan.price.monthly - yearlyMonthly) / plan.price.monthly) * 100;
    return Math.round(savings);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-dark-text-tertiary max-w-3xl mx-auto">
          Start free and upgrade when you're ready. All plans include our core resume building features.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-12">
        <div className="bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary shadow-sm'
                : 'text-gray-600 dark:text-dark-text-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary shadow-sm'
                : 'text-gray-600 dark:text-dark-text-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary'
            } relative`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-dark-bg-secondary rounded-2xl border-2 p-8 ${
              plan.popular
                ? 'border-blue-500 dark:border-blue-400 shadow-xl scale-105'
                : 'border-gray-200 dark:border-dark-border-primary shadow-lg'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.color} rounded-xl mb-4`}>
                <plan.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-dark-text-tertiary mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary">
                    ${getPrice(plan)}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-gray-600 dark:text-dark-text-tertiary">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Save {getSavings(plan)}% with yearly billing
                  </p>
                )}
              </div>

              <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-hover-bg'
              }`}>
                {plan.cta}
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary">What's included:</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-dark-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="pt-4 border-t border-gray-200 dark:border-dark-border-primary">
                  <h5 className="font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Limitations:</h5>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-gray-500 dark:text-dark-text-muted">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary overflow-hidden mb-16">
        <div className="px-8 py-6 bg-gray-50 dark:bg-dark-bg-tertiary border-b border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Feature Comparison</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border-primary">
                <th className="text-left py-4 px-8 font-semibold text-gray-900 dark:text-dark-text-primary">Features</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-dark-text-primary">Free</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-dark-text-primary">Pro</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-dark-text-primary">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
              {[
                { feature: 'Resume Templates', free: '3 basic', pro: 'Unlimited premium', enterprise: 'Unlimited + custom' },
                { feature: 'AI Content Generation', free: '✗', pro: '✓', enterprise: '✓' },
                { feature: 'Export Formats', free: 'PDF only', pro: 'PDF, DOCX', enterprise: 'All formats' },
                { feature: 'ATS Optimization', free: 'Basic', pro: 'Advanced', enterprise: 'Enterprise-grade' },
                { feature: 'Cover Letter Generator', free: '✗', pro: '✓', enterprise: '✓' },
                { feature: 'Team Collaboration', free: '✗', pro: 'Limited', enterprise: 'Unlimited' },
                { feature: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated manager' }
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-hover-bg">
                  <td className="py-4 px-8 font-medium text-gray-900 dark:text-dark-text-primary">{row.feature}</td>
                  <td className="py-4 px-6 text-center text-gray-600 dark:text-dark-text-tertiary">{row.free}</td>
                  <td className="py-4 px-6 text-center text-gray-600 dark:text-dark-text-tertiary">{row.pro}</td>
                  <td className="py-4 px-6 text-center text-gray-600 dark:text-dark-text-tertiary">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-dark-text-tertiary leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to build your perfect resume?</h2>
        <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
          Join thousands of professionals who've landed their dream jobs with ResuMaster
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => onNavigate('builder')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Start Building Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            View Templates
          </button>
        </div>
        <p className="text-blue-200 text-sm mt-4">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default Pricing;