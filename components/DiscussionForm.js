import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView,
  Alert
} from 'react-native';
import { 
  Image as ImageIcon, 
  PlusCircle, 
  BarChart, 
  Eye, 
  X 
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function DiscussionForm({ onSubmit, communityId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 2000;

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    } else {
      Alert.alert('Maximum Options', 'You can add up to 5 poll options.');
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    } else {
      Alert.alert('Minimum Options', 'A poll requires at least 2 options.');
    }
  };

  const handleUpdatePollOption = (text, index) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const handleAddImage = () => {
    // In a real app, this would open the image picker
    Alert.alert('Add Image', 'Image picker would open here.');
    
    // Mock adding an image
    if (attachments.length < 4) {
      setAttachments([
        ...attachments, 
        { 
          type: 'image', 
          url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800'
        }
      ]);
    } else {
      Alert.alert('Maximum Images', 'You can add up to 4 images.');
    }
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleTogglePoll = () => {
    setIsPollActive(!isPollActive);
    if (!isPollActive) {
      setPollOptions(['', '']);
    }
  };

  const handleSubmitDiscussion = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your discussion.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content for your discussion.');
      return;
    }

    if (isPollActive && pollOptions.some(option => !option.trim())) {
      Alert.alert('Error', 'Please fill in all poll options.');
      return;
    }

    const discussionData = {
      title,
      content,
      communityId,
      attachments,
      poll: isPollActive ? { options: pollOptions } : null
    };

    onSubmit(discussionData);
  };

  const renderPreview = () => {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Preview</Text>
        
        <View style={styles.previewPost}>
          <Text style={styles.previewPostTitle}>{title || 'Your Discussion Title'}</Text>
          <Text style={styles.previewPostContent}>
            {content || 'Your discussion content will appear here...'}
          </Text>
          
          {attachments.length > 0 && (
            <View style={styles.previewAttachments}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.previewAttachment}>
                  <Text style={styles.previewAttachmentText}>
                    [Image {index + 1}]
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {isPollActive && (
            <View style={styles.previewPoll}>
              <Text style={styles.previewPollTitle}>Poll</Text>
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.previewPollOption}>
                  <Text style={styles.previewPollOptionText}>
                    {option || `Option ${index + 1}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {!isPreviewMode ? (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter a title for your discussion"
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_TITLE_LENGTH}
            />
            <Text style={styles.charCount}>
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your discussion here..."
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={MAX_CONTENT_LENGTH}
            />
            <Text style={styles.charCount}>
              {content.length}/{MAX_CONTENT_LENGTH}
            </Text>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.label}>Attachments</Text>
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Pressable 
                      style={styles.removeAttachmentButton}
                      onPress={() => handleRemoveAttachment(index)}
                    >
                      <X size={16} color={colors.card} />
                    </Pressable>
                    <Text style={styles.attachmentText}>Image {index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {isPollActive && (
            <View style={styles.pollContainer}>
              <Text style={styles.label}>Poll Options</Text>
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.pollOptionContainer}>
                  <TextInput
                    style={styles.pollOptionInput}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => handleUpdatePollOption(text, index)}
                  />
                  {pollOptions.length > 2 && (
                    <Pressable 
                      style={styles.removePollOptionButton}
                      onPress={() => handleRemovePollOption(index)}
                    >
                      <X size={16} color={colors.textLight} />
                    </Pressable>
                  )}
                </View>
              ))}
              
              <Pressable 
                style={styles.addPollOptionButton}
                onPress={handleAddPollOption}
              >
                <PlusCircle size={16} color={colors.primary} />
                <Text style={styles.addPollOptionText}>Add Option</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Pressable 
              style={styles.actionButton}
              onPress={handleAddImage}
            >
              <ImageIcon size={20} color={colors.primary} />
              <Text style={styles.actionText}>Add Image</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.actionButton,
                isPollActive && styles.activeActionButton
              ]}
              onPress={handleTogglePoll}
            >
              <BarChart size={20} color={isPollActive ? colors.card : colors.primary} />
              <Text style={[
                styles.actionText,
                isPollActive && styles.activeActionText
              ]}>
                {isPollActive ? 'Remove Poll' : 'Add Poll'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        renderPreview()
      )}

      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.previewButton}
          onPress={() => setIsPreviewMode(!isPreviewMode)}
        >
          <Eye size={20} color={colors.primary} />
          <Text style={styles.previewButtonText}>
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Text>
        </Pressable>
        
        <Pressable 
          style={styles.submitButton}
          onPress={handleSubmitDiscussion}
        >
          <Text style={styles.submitButtonText}>Post Discussion</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  contentInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentsContainer: {
    marginBottom: 20,
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  attachmentItem: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    position: 'relative',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentText: {
    color: colors.primary,
    fontWeight: '500',
  },
  pollContainer: {
    marginBottom: 20,
  },
  pollOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  removePollOptionButton: {
    padding: 12,
  },
  addPollOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addPollOptionText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  activeActionButton: {
    backgroundColor: colors.primary,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeActionText: {
    color: colors.card,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    flex: 1,
  },
  previewButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  previewContainer: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewPost: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  previewPostTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  previewPostContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  previewAttachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  previewAttachment: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  previewAttachmentText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 12,
  },
  previewPoll: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  previewPollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  previewPollOption: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  previewPollOptionText: {
    color: colors.text,
  }
});