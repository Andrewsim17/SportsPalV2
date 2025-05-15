import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES } from '../lib/supabase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Add a function to refresh the profile data
      refreshProfile: async () => {
        const user = get().user;
        if (!user || !user.id) return false;
        
        try {
          // Call the RPC function to get profile with counts
          const { data, error } = await supabase.rpc('get_profile_with_counts', {
            profile_id_param: user.id
          });
          
          if (error) throw error;
          if (!data) return false;
          
          // Update the user object with fresh data
          set(state => ({
            user: {
              ...state.user,
              ...data,
              stats: {
                followers: data.follower_count || 0,
                following: data.following_count || 0,
                activities: state.user?.stats?.activities || 0 // Maintain existing activities count
              }
            }
          }));
          
          return true;
        } catch (error) {
          console.error('Error refreshing profile:', error);
          return false;
        }
      },
      
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (authError) throw authError;
          
          // Fetch the user profile data using maybeSingle()
          const { data: profileData, error: profileError } = await supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single()
            
          if (profileError) throw profileError;
          
          if (!profileData) {
            console.warn(`Profile not found for user ${authData.user.id}. Proceeding without profile data.`);
          }
          
          // Call the RPC function to get profile with counts
          const { data: profileWithCounts, error: countsError } = await supabase.rpc('get_profile_with_counts', {
            profile_id_param: authData.user.id
          });
          
          if (countsError) {
            console.warn('Failed to fetch profile counts:', countsError);
          }
          
          // Combine auth and profile data
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            ...(profileData || {}),
            ...(profileWithCounts || {}),
            stats: profileWithCounts ? {
              followers: profileWithCounts.follower_count || 0,
              following: profileWithCounts.following_count || 0,
              activities: 0 // Default activities count
            } : { followers: 0, following: 0, activities: 0 }
          };
          
          set({ user: userData, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name // Pass name in options.data for potential use in triggers/functions
              }
            }
          });
          
          if (authError) throw authError;
          
          // Create profile record immediately after signup
          const profileToInsert = {
            id: authData.user.id,
            name: userData.name,
            username: userData.username,
            avatar_url: userData.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'User') + '&background=6C5CE7&color=fff',
            bio: userData.bio || null,
            location: userData.location || null,
            sports: userData.sports || [],
            level: userData.level || 'beginner',
            is_coach: userData.isCoach || false
          };
          
          const { data: insertedProfile, error: profileError } = await supabase
            .from(TABLES.PROFILES)
            .insert(profileToInsert)
            .select()
            .single(); // Use single here, insert should return the single inserted row
            
          // Handle potential profile insert error more explicitly
          if (profileError) {
            console.error('Error creating profile after signup:', profileError);
            // Optionally, attempt to clean up the auth user if profile creation fails?
            // Or inform the user that profile setup failed.
            throw new Error('Failed to create user profile after signup.');
          }
                    
          set({ user: insertedProfile, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          // Catch errors from signup OR profile insert
          console.error('Registration error:', error);

          // Check if the error specifically relates to profile creation failure after auth success
          if (error.message.includes("profile creation failed") && authData?.user?.id) {
             console.warn(`Registration failed during profile creation for auth user: ${authData.user.id}. Auth user might be orphaned.`);
             // Inform the user more clearly about the specific failure point
             set({ 
               error: `Signup successful, but profile creation failed: ${error.message.replace('Signup succeeded, but profile creation failed: ','')}. Please try logging in and completing your profile, or contact support.`, 
               isLoading: false 
             });
          } else if (authData === null && error.message) { // Error likely occurred during signUp itself
             set({ error: `Signup failed: ${error.message}`, isLoading: false });
          } else { // Generic catch-all
            set({ error: error.message || 'An unexpected registration error occurred.', isLoading: false });
          }

          return false;
        }
      },
      
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, isAuthenticated: false });
          return true;
        } catch (error) {
          console.error('Logout error:', error);
          return false;
        }
      },
      
      updateProfile: async (profileData) => {
        const user = get().user;
        if (!user) return false; // No user to update
        const { id } = user;
        
        try {
          // Prepare the update payload
          const { id: _, email: __, avatar, ...otherUpdates } = profileData;
          const updates = { ...otherUpdates };
          if (avatar !== undefined) {
            updates.avatar_url = avatar; 
          }
          
          if (Object.keys(updates).length === 0) {
            console.log("Update profile called with no changes.");
            return true; 
          }
          
          // Perform the update
          const { error: updateError } = await supabase
            .from(TABLES.PROFILES)
            .update(updates)
            .eq('id', id);

          // Throw immediately if the update itself failed
          if (updateError) throw updateError; 

          // Try to select the updated profile, but allow for it to be null (RLS might hide it)
          const { data: updatedProfile, error: selectError } = await supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('id', id)
            .maybeSingle();

          // Log select error if it occurs, but don't throw unless it's critical
          if (selectError) {
             console.error('Error selecting profile after update:', selectError);
             // Decide if this error should halt the process or just be logged
             // For now, we proceed assuming the update worked if updateError was null
          }

          // Update local state
          set(state => {
            // If select returned the updated profile, use it.
            // Otherwise, merge the 'updates' we sent, assuming the DB update succeeded.
            const profileChanges = updatedProfile ? updatedProfile : updates;
            return {
              user: { ...state.user, ...profileChanges }
            };
          });
          
          if (!updatedProfile && !selectError) {
            console.warn('Profile update succeeded, but could not re-select the row. Check RLS SELECT policies.');
          }

          return true;
        } catch (error) {
          // Catches errors from the initial update call or potentially critical select errors if re-thrown
          console.error('Update profile error:', error);
          return false;
        }
      },
      
      // Initialize user session on app start
      initializeSession: async () => {
        set({ isLoading: true });
        
        try {
          // Check if there's an existing session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session) {
            // Fetch the user profile data using maybeSingle()
            let { data: profileData, error: profileError } = await supabase
              .from(TABLES.PROFILES)
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle(); // Use maybeSingle() instead of single()
              
            if (profileError) throw profileError;
            
            if (!profileData) {
              console.warn(`Profile not found for active session user ${session.user.id}. Creating profile for OAuth user.`);
              
              // Check if user was authenticated via OAuth
              const isOAuthUser = session.user.app_metadata?.provider && 
                                 session.user.app_metadata.provider !== 'email';
              
              if (isOAuthUser) {
                // Create profile for OAuth user
                profileData = await get().createOrUpdateOAuthProfile(session.user);
              }
            }
            
            // Combine auth and profile data (profileData might be null)
            const userData = {
              id: session.user.id,
              email: session.user.email,
              ...(profileData || {})
            };
            
            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            // No active session
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Session initialization error:', error);
          set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
        }
      },
      
      addFunds: (amount) => {
        set(state => ({
          user: {
            ...state.user,
            // Ensure wallet exists before trying to update it
            wallet: state.user?.wallet ? {
              ...state.user.wallet,
              balance: (state.user.wallet.balance || 0) + amount,
              transactions: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'deposit',
                  amount,
                  date: new Date().toISOString(),
                  description: 'Added funds'
                },
                ...(state.user.wallet.transactions || [])
              ]
            } : {
              balance: amount,
              currency: 'USD', // Default currency
              transactions: [{
                id: Math.random().toString(36).substr(2, 9),
                type: 'deposit',
                amount,
                date: new Date().toISOString(),
                description: 'Added funds'
              }]
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
        
        const selectedPlan = plans[plan] || plans.free;
        const cost = plan === 'premium' ? 9.99 : plan === 'pro' ? 19.99 : 0;
        
        set(state => {
          // Ensure user and wallet exist before updating
          if (!state.user) return {}; 
          const currentBalance = state.user.wallet?.balance || 0;
          
          return {
            user: {
              ...state.user,
              subscription: selectedPlan,
              wallet: {
                ...(state.user.wallet || { balance: 0, currency: 'USD', transactions: [] }),
                balance: currentBalance - cost,
                transactions: [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'subscription',
                    amount: -cost,
                    date: new Date().toISOString(),
                    description: `${selectedPlan.plan.charAt(0).toUpperCase() + selectedPlan.plan.slice(1)} subscription`
                  },
                  ...(state.user.wallet?.transactions || [])
                ]
              }
            }
          };
        });
      },
      
      recordActivity: (activity) => {
        // This should ideally interact with activitiesApi
        console.log('Activity recorded (local state - needs API integration):', activity);
        // Example of how it might be integrated (requires activitiesApi to be imported)
        /*
        try {
          await activitiesApi.createActivity({ ...activity, user_id: get().user.id });
        } catch (error) {
          console.error("Failed to record activity via API:", error);
        }
        */
      },
      
      // Google OAuth sign in
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'sportspalsocialapp://auth/callback'
            }
          });
          
          if (error) throw error;
          
          // The actual auth process will be handled by a deep link callback
          // This function just initiates the OAuth flow
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Create or update profile when signing in with OAuth
      createOrUpdateOAuthProfile: async (authUser) => {
        if (!authUser || !authUser.id) return false;
        
        try {
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
            
          if (profileError) throw profileError;
          
          // If profile exists, return it
          if (existingProfile) return existingProfile;
          
          // Create new profile based on OAuth user data
          const userData = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
            avatar_url: authUser.user_metadata?.avatar_url || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User')}&background=6C5CE7&color=fff`,
            username: `user${Math.floor(Math.random() * 10000)}`, // Generate random username
            level: 'beginner',
            sports: [],
            is_coach: false
          };
          
          // Insert new profile
          const { data: newProfile, error: insertError } = await supabase
            .from(TABLES.PROFILES)
            .insert({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              avatar_url: userData.avatar_url,
              username: userData.username,
              level: userData.level,
              sports: userData.sports,
              is_coach: userData.is_coach
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          
          return newProfile;
        } catch (error) {
          console.error('Error creating/updating OAuth profile:', error);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);