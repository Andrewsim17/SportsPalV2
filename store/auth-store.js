import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // Simulating API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (credentials.email === 'user@example.com' && credentials.password === 'password') {
            const user = {
              id: '1',
              name: 'John Doe',
              email: credentials.email,
              username: 'johndoe',
              avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6C5CE7&color=fff',
              bio: 'Sports enthusiast',
              location: 'Kuala Lumpur',
              sports: ['Basketball', 'Tennis'],
              level: 'intermediate',
              isCoach: false,
              wallet: {
                balance: 250,
                currency: 'USD',
                transactions: []
              },
              subscription: {
                plan: 'free',
                expiresAt: null,
                features: ['Basic Access', 'Join Games', 'Track Activities']
              }
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } else {
            set({ error: 'Invalid email or password', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // Simulating API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Add default wallet and subscription data
          const user = {
            ...userData,
            id: Math.random().toString(36).substr(2, 9),
            wallet: {
              balance: 0,
              currency: 'USD',
              transactions: []
            },
            subscription: {
              plan: 'free',
              expiresAt: null,
              features: ['Basic Access', 'Join Games', 'Track Activities']
            }
          };
          
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: (profileData) => {
        set(state => ({
          user: { ...state.user, ...profileData }
        }));
      },
      
      addFunds: (amount) => {
        set(state => ({
          user: {
            ...state.user,
            wallet: {
              ...state.user.wallet,
              balance: state.user.wallet.balance + amount,
              transactions: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'deposit',
                  amount,
                  date: new Date().toISOString(),
                  description: 'Added funds'
                },
                ...state.user.wallet.transactions
              ]
            }
          }
        }));
      },
      
      updateSubscription: (plan) => {
        const plans = {
          free: {
            plan: 'free',
            expiresAt: null,
            features: ['Basic Access', 'Join Games', 'Track Activities']
          },
          premium: {
            plan: 'premium',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            features: [
              'All Free Features',
              'Priority Booking',
              'Advanced Analytics',
              'No Ads',
              'Exclusive Events'
            ]
          },
          pro: {
            plan: 'pro',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            features: [
              'All Premium Features',
              'Personal Coach',
              'Unlimited Activity Recording',
              'Custom Training Plans',
              'VIP Support'
            ]
          }
        };
        
        set(state => ({
          user: {
            ...state.user,
            subscription: plans[plan] || plans.free,
            wallet: {
              ...state.user.wallet,
              transactions: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'subscription',
                  amount: plan === 'premium' ? -9.99 : plan === 'pro' ? -19.99 : 0,
                  date: new Date().toISOString(),
                  description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription`
                },
                ...state.user.wallet.transactions
              ],
              balance: state.user.wallet.balance - (plan === 'premium' ? 9.99 : plan === 'pro' ? 19.99 : 0)
            }
          }
        }));
      },
      
      recordActivity: (activity) => {
        // In a real app, this would be handled by a separate activity store
        console.log('Activity recorded:', activity);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);