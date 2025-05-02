import { supabase, TABLES } from '../supabase';

// Profiles API
export const profilesApi = {
  getProfile: async (userId) => {
    if (!userId) throw new Error("User ID is required.");

    // Call the RPC function
    console.log(`Calling RPC get_profile_with_counts for ID: ${userId}`);
    const { data, error } = await supabase.rpc('get_profile_with_counts', {
      profile_id_param: userId
    });

    if (error) {
      console.error('Error calling get_profile_with_counts RPC:', error);
      throw error;
    }
    if (!data) {
      console.warn(`RPC get_profile_with_counts returned no data for ID: ${userId}`);
      return null;
    }

    // The data returned by the RPC is the profile JSON object
    console.log('RPC get_profile_with_counts successful, data:', data);
    return data;
  },
  
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getProfiles: async (filters = {}) => {
    let query = supabase.from(TABLES.PROFILES).select('*');
    
    // Apply filters if provided
    if (filters.isCoach) {
      query = query.eq('is_coach', true);
    }
    
    if (filters.sport) {
      query = query.contains('sports', [filters.sport]);
    }
    
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// Games API
export const gamesApi = {
  getGames: async (filters = {}) => {
    let query = supabase
      .from(TABLES.GAMES)
      .select(`
        *,
        organizer:profiles(*),
        venue:venues(*),
        participants:game_participants(*, player:profiles(*))
      `);
    
    // --- Default filter: Only show upcoming games --- 
    // Apply this unless a specific filter requests past games (e.g., filters.includePast = true)
    if (!filters.includePast) {
      query = query.gte('date', new Date().toISOString()); 
    }
    // --- End default filter ---

    // Apply specific filters if provided
    if (filters.sport) {
      query = query.eq('sport', filters.sport);
    }
    
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
    }
    
    // Sort by date (upcoming first)
    query = query.order('date', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  getGame: async (gameId) => {
    const { data, error } = await supabase
      .from(TABLES.GAMES)
      .select(`
        *,
        organizer:profiles(*),
        venue:venues(*),
        participants:game_participants(*, player:profiles(*))
      `)
      .eq('id', gameId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  createGame: async (gameData) => {
    const { data, error } = await supabase
      .from(TABLES.GAMES)
      .insert(gameData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  updateGame: async (gameId, updates) => {
    const { data, error } = await supabase
      .from(TABLES.GAMES)
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  joinGame: async (gameId, userId, status = 'confirmed') => {
    const { data, error } = await supabase
      .from(TABLES.GAME_PARTICIPANTS)
      .insert({
        game_id: gameId,
        user_id: userId,
        status
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  leaveGame: async (gameId, userId) => {
    const { error } = await supabase
      .from(TABLES.GAME_PARTICIPANTS)
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  },
  
  getUserGames: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.GAME_PARTICIPANTS)
      .select(`
        status,
        game:games(
          *,
          venue:venues(*),
          participants:game_participants(user_id)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data.map(item => ({
      ...item.game,
      participants: item.game.participants?.length || 0,
      userStatus: item.status
    }));
  }
};

// Venues API
export const venuesApi = {
  getVenues: async (filters = {}) => {
    let query = supabase.from(TABLES.VENUES).select('*');
    
    // Apply filters if provided
    if (filters.sport) {
      query = query.contains('sports', [filters.sport]);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  getVenue: async (venueId) => {
    const { data, error } = await supabase
      .from(TABLES.VENUES)
      .select(`
        *,
        courts: ${TABLES.COURTS}(*)  // Fetch related courts
      `)
      .eq('id', venueId)
      .single();
      
    if (error) throw error;
    return data;
  },

  getVenueAvailability: async (venueId, sport, date) => {
    if (!venueId || !sport || !date) return [];

    // Format date to match the start/end of the selected day in UTC
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    // 1. Find courts in the venue matching the sport
    const { data: courts, error: courtsError } = await supabase
      .from(TABLES.COURTS)
      .select('id')
      .eq('venue_id', venueId)
      .eq('sport', sport)
      .eq('status', 'active'); // Only consider active courts

    if (courtsError) throw courtsError;
    if (!courts || courts.length === 0) return []; // No matching courts

    const courtIds = courts.map(c => c.id);

    // 2. Find bookings for those courts on the selected date
    const { data: bookings, error: bookingsError } = await supabase
      .from(TABLES.BOOKINGS)
      .select('court_id, start_time, end_time')
      .in('court_id', courtIds)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString()) // Filter bookings starting on the selected date
      .eq('status', 'confirmed'); // Only consider confirmed bookings

    if (bookingsError) throw bookingsError;

    // Return the list of booked slots
    return bookings || [];
  }
};

// Activities API
export const activitiesApi = {
  getActivities: async (limit = 20, page = 0, userId = null) => {
    let query = supabase
      .from(TABLES.ACTIVITIES)
      .select(`
        *,
        user:profiles(*),
        game:games(*),
        likes:activity_likes!left(user_id),
        comments:activity_comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    const { data, error } = await query;
      
    if (error) throw error;
    return data;
  },
  
  getActivity: async (activityId) => {
    if (!activityId) throw new Error("Activity ID is required.");
    
    const { data, error } = await supabase
      .from(TABLES.ACTIVITIES)
      .select(`
        *,
        user:profiles(*),
        game:games(*),
        likes:activity_likes(user_id),
        comments:activity_comments(*, user:profiles(*))
      `)
      .eq('id', activityId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getUserActivities: async (userId, limit = 5, page = 0) => {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITIES)
      .select(`
        *,
        game:games(*),
        likes:activity_likes!left(user_id),
        comments:activity_comments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) {
      console.error('Error fetching user activities (without profile join):', error);
      throw error;
    }
    return data;
  },
  
  createActivity: async (activityData) => {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITIES)
      .insert(activityData)
      .select()
      .single();
      
    if (error) throw error;
    
    // Try to update activity count in auth store if it's implemented
    try {
      // This is a client-side approach that would be called by the component
      // that creates the activity. The component would need to have access
      // to the auth store's update function.
      const { refreshProfile } = await import('../store/auth-store');
      if (typeof refreshProfile === 'function') {
        refreshProfile();
      }
    } catch (countError) {
      console.warn('Could not update activity count in user stats', countError);
    }
    
    return data;
  },
  
  likeActivity: async (activityId, userId) => {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITY_LIKES)
      .insert({
        activity_id: activityId,
        user_id: userId
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Create notification for activity owner
    try {
      // Get the activity to find its owner
      const { data: activity } = await supabase
        .from(TABLES.ACTIVITIES)
        .select('user_id')
        .eq('id', activityId)
        .single();
        
      if (activity && activity.user_id !== userId) {
        // Get liker's name
        const { data: userProfile } = await supabase
          .from(TABLES.PROFILES)
          .select('name')
          .eq('id', userId)
          .single();
          
        const userName = userProfile?.name || 'Someone';
        
        // Create notification for activity owner
        await notificationsApi.createNotification({
          user_id: activity.user_id,
          sender_id: userId,
          type: 'like',
          content: `${userName} liked your post`,
          link: `/activity/${activityId}`,
          related_entity_id: data.id
        });
        
        console.log('Like notification created');
      }
    } catch (notifError) {
      console.error('Failed to create like notification:', notifError);
      // Don't fail the like operation if notification fails
    }
    
    return data;
  },
  
  unlikeActivity: async (activityId, userId) => {
    const { error } = await supabase
      .from(TABLES.ACTIVITY_LIKES)
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  },
  
  addCommentToActivity: async (activityId, userId, content) => {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITY_COMMENTS)
      .insert({
        activity_id: activityId,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) throw error;
    
    // Create notification for activity owner
    try {
      // Get the activity to find its owner
      const { data: activity } = await supabase
        .from(TABLES.ACTIVITIES)
        .select('user_id')
        .eq('id', activityId)
        .single();
        
      if (activity && activity.user_id !== userId) {
        // Create notification for activity owner using the user profile data we already have
        const userName = data.user?.name || 'Someone';
        
        await notificationsApi.createNotification({
          user_id: activity.user_id,
          sender_id: userId,
          type: 'comment',
          content: `${userName} commented on your post`,
          link: `/activity/${activityId}`,
          related_entity_id: data.id
        });
        
        console.log('Comment notification created');
      }
    } catch (notifError) {
      console.error('Failed to create comment notification:', notifError);
      // Don't fail the comment operation if notification fails
    }
    
    return data;
  }
};

// Communities API
export const communitiesApi = {
  getCommunities: async (filters = {}) => {
    let query = supabase
      .from(TABLES.COMMUNITIES)
      .select(`
        *,
        members:community_members(count)
      `);
    
    // Apply filters if provided
    if (filters.sport) {
      query = query.eq('sport', filters.sport);
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  getCommunity: async (communityId) => {
    const { data, error } = await supabase
      .from(TABLES.COMMUNITIES)
      .select(`
        *,
        members:community_members(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', communityId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  joinCommunity: async (communityId, userId, role = 'member') => {
    const { data, error } = await supabase
      .from(TABLES.COMMUNITY_MEMBERS)
      .insert({
        community_id: communityId,
        user_id: userId,
        role
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  leaveCommunity: async (communityId, userId) => {
    const { error } = await supabase
      .from(TABLES.COMMUNITY_MEMBERS)
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);
      
    if (error) throw error;
    return true;
  }
};

// Social API (followers)
export const socialApi = {
  followUser: async (followerId, followingId) => {
    // First insert the follower record
    const { data, error } = await supabase
      .from(TABLES.FOLLOWERS)
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Then create a notification for the user being followed
    try {
      // Get follower's name for the notification
      const { data: followerProfile } = await supabase
        .from(TABLES.PROFILES)
        .select('name')
        .eq('id', followerId)
        .single();
        
      const followerName = followerProfile?.name || 'Someone';
      
      // Create the notification using the helper function
      await notificationsApi.createNotification({
        user_id: followingId, // The person being followed receives notification
        sender_id: followerId, // The follower is the sender
        type: 'follow',
        content: `${followerName} started following you`,
        link: `/player/${followerId}`, // Link to follower's profile
        related_entity_id: data.id // The followers record ID
      });
        
      console.log('Follow notification created');
    } catch (notifError) {
      // Don't fail the follow process if notification fails
      console.error('Failed to create follow notification:', notifError);
    }
    
    return data;
  },
  
  unfollowUser: async (followerId, followingId) => {
    const { error } = await supabase
      .from(TABLES.FOLLOWERS)
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
      
    if (error) throw error;
    return true;
  },
  
  getFollowers: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.FOLLOWERS)
      .select(`
        *,
        follower:profiles(*)
      `)
      .eq('following_id', userId);
      
    if (error) throw error;
    return data.map(item => item.follower);
  },
  
  getFollowing: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.FOLLOWERS)
      .select('following_id') // Select only the ID we need
      .eq('follower_id', userId);
      
    if (error) {
       console.error('Error fetching following list:', error); // Add logging
       throw error;
    }
    // Map to return just the array of IDs
    return data ? data.map(item => item.following_id) : [];
  }
};

// Chat API
export const chatApi = {
  getMyChatRooms: async (userId) => {
    if (!userId) return [];
    // Find rooms where the user is a participant
    const { data: participantEntries, error: participantError } = await supabase
      .from(TABLES.CHAT_PARTICIPANTS)
      .select('chat_id')
      .eq('user_id', userId);

    if (participantError) throw participantError;
    if (!participantEntries || participantEntries.length === 0) return [];

    const roomIds = participantEntries.map(p => p.chat_id);

    // Fetch details for those rooms (using 'chats' table name)
    const { data: rooms, error: roomsError } = await supabase
      .from(TABLES.CHATS)
      .select(`
        *,
        participants:chat_participants!inner(*, user:profiles(*)),
        last_message:messages(*)
      `)
      .in('id', roomIds)
      .order('created_at', { foreignTable: 'messages', ascending: false })
      .limit(1, { foreignTable: 'messages' }); // Get only the latest message

    if (roomsError) throw roomsError;

    // Adapt the data slightly for easier use in the UI
    return rooms.map(room => {
       // Find the other participant(s) for display purposes
       const otherParticipants = room.participants.filter(p => p.user_id !== userId);
       // Determine chat name/image (simple logic for 1-on-1)
       let chatName = 'Group Chat';
       let chatImage = null; // Default group image?
       if (otherParticipants.length === 1) {
           chatName = otherParticipants[0].user.name || 'Unknown User';
           chatImage = otherParticipants[0].user.avatar_url;
       }
       // TODO: Add logic for group chat names/images if needed
       
       return {
           ...room,
           chatName,
           chatImage,
           lastMessage: room.last_message?.[0] // Get the single last message object
       };
    });
  },

  getMessagesForChat: async (chatId, limit = 50, page = 0) => {
    if (!chatId) return [];
    const { data, error } = await supabase
      .from(TABLES.MESSAGES)
      .select('*, sender:profiles(*)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data.reverse();
  },

  sendMessage: async (chatId, senderId, content) => {
     if (!chatId || !senderId || !content) throw new Error('Missing required fields for sending message.');
     const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .insert({ chat_id: chatId, sender_id: senderId, content })
        .select('*, sender:profiles(*)')
        .single();
        
     if (error) throw error;
     return data;
  },
  
  // Function to find or create a 1-on-1 chat room
  findOrCreateChatRoom: async (userId1, userId2) => {
    if (!userId1 || !userId2) throw new Error('Both user IDs are required.');
    if (userId1 === userId2) throw new Error('Cannot create chat room with the same user.');

    try {
      // Check if a room with these two participants already exists
      const { data: existingRooms, error: findError } = await supabase.rpc('get_chat_room_with_users', { user_id_1: userId1, user_id_2: userId2 });

      if (findError) {
          console.error("Error finding chat room:", findError);
          throw findError;
      }
      
      if (existingRooms && existingRooms.length > 0) {
         console.log("Found existing room:", existingRooms[0].room_id);
         return { id: existingRooms[0].room_id, created_new: false };
      }

      // If no room exists, create a new one (using 'chats' table name)
      console.log("Creating new chat room for", userId1, "and", userId2);
      
      // Check auth session before proceeding
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Authentication session error:", sessionError);
        throw new Error("User not authenticated or session expired");
      }
      if (!session) {
        console.error("No active session found");
        throw new Error("No active authentication session");
      }
      console.log("Auth session found, access token available:", !!session.access_token);
      
      // Create the new chat room - trigger will set created_by automatically
      const { data: newRoom, error: createRoomError } = await supabase
        .from(TABLES.CHATS)
        .insert({
          is_group: false,  // Explicitly set is_group to false for 1-on-1 chats
        }) 
        .select()
        .single();

      if (createRoomError) {
        console.error("Error creating chat room:", createRoomError);
        throw createRoomError;
      }
      if (!newRoom) throw new Error('Failed to create chat room.');

      // Add participants to the new room
      const { error: participantsError } = await supabase
        .from(TABLES.CHAT_PARTICIPANTS)
        .insert([
          { chat_id: newRoom.id, user_id: userId1 },
          { chat_id: newRoom.id, user_id: userId2 },
        ]);

      if (participantsError) {
         // Attempt to clean up the created room if adding participants fails
         console.error("Error adding participants, attempting to delete room:", participantsError);
         await supabase.from(TABLES.CHATS).delete().eq('id', newRoom.id);
         throw participantsError;
      }
      
      console.log("Created new room with ID:", newRoom.id);
      return { id: newRoom.id, created_new: true };
    } catch (error) {
      console.error("Error in findOrCreateChatRoom:", error);
      throw error;
    }
  },

  getUnreadMessageCount: async (userId) => {
    if (!userId) return 0; 

    // Call the database function
    const { data, error } = await supabase.rpc('get_total_unread_message_count', {
      user_id_param: userId
    });

    if (error) {
      console.error('Error fetching unread message count via RPC:', error);
      return 0; 
    }
    
    // data should directly be the count returned by the function
    return data || 0;
  },

  markChatAsRead: async (chatId, userId) => {
    if (!chatId || !userId) return false;
    
    console.log(`Marking chat ${chatId} as read for user ${userId}`);
    
    try {
      const { error } = await supabase
        .from(TABLES.CHAT_PARTICIPANTS)
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error marking chat as read:', error);
        return false;
      }
      
      console.log('Chat marked as read successfully');
      return true;
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
      return false;
    }
  }
};

// Notifications API
export const notificationsApi = {
  createNotification: async (notification) => {
    // Required fields validation
    if (!notification.user_id || !notification.type) {
      console.error('Missing required notification fields', notification);
      return null;
    }
    
    console.log('Creating notification:', notification);
    
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert({
          user_id: notification.user_id,
          sender_id: notification.sender_id,
          type: notification.type,
          content: notification.content,
          link: notification.link,
          related_entity_id: notification.related_entity_id,
          is_read: false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
      
      console.log('Notification created successfully:', data);
      return data;
    } catch (err) {
      console.error('Failed to create notification:', err);
      return null;
    }
  },

  getUnreadNotificationCount: async (userId) => {
    if (!userId) return 0;

    // Call the database function
    const { data, error } = await supabase.rpc('get_total_unread_notification_count', {
      user_id_param: userId
    });

    if (error) {
      console.error('Error fetching unread notification count via RPC:', error);
      return 0; 
    }
    
    return data || 0;
  },

  getNotifications: async (userId, limit = 20, page = 0) => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    return data || [];
  },

  markNotificationAsRead: async (notificationId) => {
    if (!notificationId) return false;
    const { error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      // Don't throw, maybe return false to indicate failure
      return false; 
    }
    return true;
  },

  markAllNotificationsAsRead: async (userId) => {
    if (!userId) return false;
    const { error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false); // Only update unread ones
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    return true;
  }

  // TODO: Add other notification functions here (e.g., getNotifications, markAsRead)
};

// Achievements API
// ... rest of the file ... 