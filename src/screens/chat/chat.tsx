import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio, ResizeMode, Video } from 'expo-av';
import { manipulateAsync } from 'expo-image-manipulator';

//import { Audio } from 'expo-audio';
//import { Video, ResizeMode } from 'expo-video'; não remover //IMPORTANTE PARA ATUALIZAR DEPOIS

// =======================
// Types & Helpers
// =======================
enum FileType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

type Message = {
  id: string;
  content: string;
  senderPF?: { id: string };
  senderPJ?: { id: string };
  receiverPF?: { id: string };
  receiverPJ?: { id: string };
  sentAt: string;
  fileUrl?: string;
  fileType?: FileType;
  // previewUri is only used locally, not sent to server
  previewUri?: string;
};

const API_BASE = 'https://api-production-d036.up.railway.app/';
const resolveUrl = (url?: string) =>
  !url ? '' : url.startsWith('http') ? url : `${API_BASE}${url}`;

// =======================
// Component
// =======================
export default function ChatByOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const otherUserId = typeof params.otherUserId === 'string' ? params.otherUserId : '';
  const name = typeof params.name === 'string' ? params.name : 'Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // =======================
  // WebSocket Connection
  // =======================
  useEffect(() => {
    if (!orderId || !otherUserId) {
      Alert.alert('Erro', 'Parâmetros inválidos para o chat.');
      return;
    }

    let socket: Socket;

    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Erro', 'Token JWT não encontrado');
          return;
        }

        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setUserId(decodedPayload.sub);

        socket = io('wss://api-production-d036.up.railway.app/chat', {
          path: '/socket.io',
          transports: ['websocket'],
          auth: { token },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('joinRoom', { otherUserId });
        });

        socket.on('chatHistory', (msgs: Message[]) => {
          setMessages(msgs);
        });

        // deduplicated newMessage handler
        socket.on('newMessage', (msg: Message) => {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });

        socket.on('error', (err) => {
          Alert.alert('Erro', err.message || 'Erro no WebSocket');
        });
      } catch (err) {
        console.error('[Socket] Erro na conexão:', err);
      }
    };

    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId, otherUserId]);

  // =======================
  // Auto-scroll
  // =======================
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // =======================
  // Send Text Message
  // =======================
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current || !userId) return;
    socketRef.current.emit('sendMessage', {
      receiverId: otherUserId,
      content: trimmed,
    });
    setInput('');
  };

  // =======================
  // File Handlers
  // =======================
  const handlePickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua mídia.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const compressed = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1000 } }],
          { compress: 0.7 }
        );
        await uploadFile(compressed.uri, 'image');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0].uri, 'image');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      const anyResult = result as any;
      const docUri = anyResult.uri ?? anyResult.fileCopyUri;
      if (typeof docUri === 'string') {
        await uploadFile(docUri, 'document');
      } else {
        console.log('Documento não selecionado ou sem URI');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o documento.');
    } finally {
      setIsLoading(false);
    }
  };

  // =======================
  // Audio Recording
  // =======================
  const startRecording = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para gravar áudio.');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsLoading(true);
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setRecording(null);
    if (uri) await uploadFile(uri, 'audio');
    setIsLoading(false);
  };

  // =======================
  // Upload File with Optimistic UI & Progress
  // =======================
  const uploadFile = async (
    fileUri: string,
    type: 'image' | 'audio' | 'video' | 'document'
  ) => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Erro', 'Token JWT não encontrado');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: '',
      sentAt: new Date().toISOString(),
      fileUrl: 'processing',
      fileType: type.toUpperCase() as FileType,
      senderPF: { id: userId! },
      receiverPJ: { id: otherUserId },
      previewUri: fileUri,
    };
    setMessages(prev => [...prev, tempMessage]);

    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) {
      Alert.alert('Erro', 'Arquivo não encontrado');
      return;
    }
    const name = fileUri.split('/').pop()!;
    let mime = 'application/octet-stream';
    if (type === 'image') mime = 'image/jpeg';
    if (type === 'audio') mime = 'audio/m4a';
    if (type === 'video') mime = 'video/mp4';

    const form = new FormData();
    form.append('file', { uri: fileUri, name, type: mime } as any);
    form.append('receiverId', otherUserId);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}chat/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
        setIsLoading(true);
      }
    };

    xhr.onload = () => {
      setIsLoading(false);
      setUploadProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        const real: Message = JSON.parse(xhr.responseText);
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? real : m))
        );
      } else {
        Alert.alert('Erro', 'Falha ao enviar arquivo');
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    };

    xhr.onerror = () => {
      setIsLoading(false);
      setUploadProgress(0);
      Alert.alert('Erro', 'Erro de rede ao enviar arquivo');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    };

    xhr.send(form);
  };

  // =======================
  // Helpers for Rendering
  // =======================
  const getSenderId = (msg: Message) => msg.senderPF?.id || msg.senderPJ?.id;

  const renderMessage = (msg: Message, isSelf: boolean) => {
    if (msg.fileUrl) {
      switch (msg.fileType) {
        case FileType.IMAGE:
          if (msg.fileUrl === 'processing' && msg.previewUri) {
            return <Image source={{ uri: msg.previewUri }} style={styles.media} />;
          }
          return (
            <Image
              source={{ uri: resolveUrl(msg.fileUrl) }}
              style={styles.media}
            />
          );
        case FileType.VIDEO:
          if (msg.fileUrl === 'processing' && msg.previewUri) {
            return (
              <Video
                source={{ uri: msg.previewUri }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            );
          }
          return (
            <Video
              source={{ uri: resolveUrl(msg.fileUrl) }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          );
        case FileType.AUDIO:
          return (
            <View style={styles.row}>
              <FontAwesome5
                name="microphone"
                size={24}
                color={isSelf ? 'white' : 'black'}
              />
              <Text style={styles.text}>{msg.content || 'Áudio'}</Text>
            </View>
          );
        case FileType.DOCUMENT:
          return (
            <TouchableOpacity
              onPress={() => Linking.openURL(resolveUrl(msg.fileUrl))}
              style={styles.row}
            >
              <FontAwesome5
                name="file"
                size={24}
                color={isSelf ? 'white' : 'black'}
              />
              <Text style={[styles.text, styles.link]}>
                Abrir documento
              </Text>
            </TouchableOpacity>
          );
      }
    }
    return <Text style={styles.text}>{msg.content}</Text>;
  };

  // =======================
  // Render
  // =======================
  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[styles.progressBar, { width: `${uploadProgress}%` }]}
            />
          </View>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messages}
        >
          {messages.map(msg => {
            const isSelf = getSenderId(msg) === userId;
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  isSelf ? styles.selfAlign : styles.otherAlign,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isSelf ? styles.selfBubble : styles.otherBubble,
                  ]}
                >
                  {renderMessage(msg, isSelf)}
                  <Text style={styles.time}>
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.attachmentBar}>
          <TouchableOpacity onPress={handlePickImage}>
            <FontAwesome5 name="images" size={20} color="#6656" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTakePhoto}>
            <FontAwesome5 name="camera" size={20} color="#6566" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickDocument}>
            <FontAwesome5 name="file" size={20} color="#6566" />
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <FontAwesome5
              name="microphone"
              size={20}
              color={isRecording ? 'red' : '#6656'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity onPress={handleSend}>
            <FontAwesome5 name="paper-plane" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 9,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { marginLeft: 16, fontSize: 18, fontWeight: '600' },
  messages: { padding: 12 },
  messageContainer: { marginBottom: 12, flexDirection: 'row' },
  selfAlign: { justifyContent: 'flex-end' },
  otherAlign: { justifyContent: 'flex-start' },
  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  selfBubble: { backgroundColor: '#fbc02d' },
  otherBubble: { backgroundColor: '#e0e0e0' },
  text: { color: '#000' },
  time: { fontSize: 10, color: '#555', marginTop: 4, textAlign: 'right' },
  media: { width: 200, height: 200, borderRadius: 8 },
  video: { width: 220, height: 160, borderRadius: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  link: { textDecorationLine: 'underline' },
  attachmentBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBackground: {
    height: 3,
    backgroundColor: '#eee',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#fbc02d',
  },
});
