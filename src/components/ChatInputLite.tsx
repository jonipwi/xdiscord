import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Image as ImageIcon, FileText, Smile, Vote, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { debugLog } from '../utils/debugLogger';

interface MessageContent {
  options?: string[];
  [key: string]: unknown;
}

interface ChatInputLiteProps {
  onSendMessage: (message: string, type: string, content?: MessageContent) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  onSendImage?: (file: File) => void;
  onSendFile?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInputLite: React.FC<ChatInputLiteProps> = ({
  onSendMessage,
  onSendVoice,
  onSendImage,
  onSendFile,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [showVotingOptions, setShowVotingOptions] = useState(false);
  const [showGraphCreator, setShowGraphCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAttachmentMenu && !target.closest('.attachment-menu')) {
        setShowAttachmentMenu(false);
      }
      if (showEmoticonPicker && !target.closest('.emoticon-picker')) {
        setShowEmoticonPicker(false);
      }
      if (showVotingOptions && !target.closest('.voting-creator')) {
        setShowVotingOptions(false);
      }
      if (showGraphCreator && !target.closest('.graph-creator')) {
        setShowGraphCreator(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachmentMenu, showEmoticonPicker, showVotingOptions, showGraphCreator]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      debugLog.info('ChatInputLite', 'Sending text message', {
        message_length: message.trim().length,
        message_preview: message.trim().substring(0, 50),
      });
      onSendMessage(message.trim(), 'text');
      setMessage('');
    } else {
      debugLog.warn('ChatInputLite', 'Send attempted but blocked', {
        message_empty: !message.trim(),
        component_disabled: disabled,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      debugLog.debug('ChatInputLite', 'Enter key pressed, sending message');
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      debugLog.info('ChatInputLite', 'Stopping voice recording');
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      debugLog.info('ChatInputLite', 'Starting voice recording');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          debugLog.debug('ChatInputLite', 'Voice recording data chunk received', {
            chunk_size: e.data.size,
          });
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          debugLog.info('ChatInputLite', 'Voice recording completed', {
            blob_size: audioBlob.size,
            blob_type: audioBlob.type,
            chunks_count: chunks.length,
          });
          onSendVoice?.(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        debugLog.error('ChatInputLite', 'Failed to start voice recording', error as Error, {
          error_type: (error as Error).name,
        });
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      debugLog.info('ChatInputLite', 'File selected for upload', {
        type,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });
      if (type === 'image') {
        onSendImage?.(file);
      } else {
        onSendFile?.(file);
      }
    } else {
      debugLog.warn('ChatInputLite', 'File input change triggered but no file selected', { type });
    }
    e.target.value = '';
  };

  const handleEmoticonSelect = (emoticon: string) => {
    debugLog.info('ChatInputLite', 'Emoticon selected', { emoticon });
    onSendMessage(emoticon, 'emoticon');
    setShowEmoticonPicker(false);
  };

  const handleGifEmoticonSelect = (gifPath: string) => {
    debugLog.info('ChatInputLite', 'GIF emoticon selected', { gifPath });
    onSendMessage(gifPath, 'gif_emoticon');
    setShowEmoticonPicker(false);
  };

  const handleAttachmentMenuClick = (type: 'image' | 'file' | 'emoticon' | 'voting' | 'graph') => {
    setShowAttachmentMenu(false);
    
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'file':
        fileInputRef.current?.click();
        break;
      case 'emoticon':
        setShowEmoticonPicker(true);
        break;
      case 'voting':
        setShowVotingOptions(true);
        break;
      case 'graph':
        setShowGraphCreator(true);
        break;
    }
  };

  const handleVotingCreate = (question: string, options: string[]) => {
    debugLog.info('ChatInputLite', 'Voting poll created', {
      question,
      options_count: options.length,
      options,
    });
    onSendMessage(question, 'voting', { options });
    setShowVotingOptions(false);
  };

  const handleGraphCreate = (title: string, data: { name: string; value: number }[]) => {
    debugLog.info('ChatInputLite', 'Graph created', {
      title,
      data_points: data.length,
      data,
    });
    onSendMessage(title, 'graph', { data });
    setShowGraphCreator(false);
  };

  const emoticons = ['😀', '😂', '😊', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️'];

  const gifEmoticons = [
    { name: 'thumbs-up', path: '/emoticons/thumbs-up.gif' },
    { name: 'laugh', path: '/emoticons/laugh.gif' },
    { name: 'heart', path: '/emoticons/heart.gif' },
    { name: 'wink', path: '/emoticons/wink.gif' },
  ];

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-4 text-xl border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            rows={1}
            style={{ minHeight: '64px', maxHeight: '120px' }}
          />

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileChange(e, 'file')}
            className="hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice recording - Large button for elderly */}
          <button
            onClick={handleVoiceRecord}
            disabled={disabled}
            className={`p-4 rounded-xl transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
            } disabled:opacity-50`}
            title={isRecording ? 'Stop recording' : 'Record voice'}
          >
            <Mic size={32} />
          </button>

          {/* Attachment menu button - Large button for elderly */}
          <div className="relative attachment-menu">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              disabled={disabled}
              className="p-4 text-gray-600 hover:bg-gray-100 border-2 border-gray-300 rounded-xl transition-colors disabled:opacity-50"
              title="Add attachment"
            >
              <Paperclip size={32} />
            </button>

            {/* Attachment menu popup - Larger for elderly */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border-2 rounded-xl shadow-xl py-2 w-64 z-10">
                <button
                  onClick={() => handleAttachmentMenuClick('image')}
                  className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center space-x-4 text-lg"
                >
                  <ImageIcon size={28} className="text-blue-500" />
                  <span className="font-medium">Image</span>
                </button>
                <button
                  onClick={() => handleAttachmentMenuClick('file')}
                  className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center space-x-4 text-lg"
                >
                  <FileText size={28} className="text-gray-500" />
                  <span className="font-medium">File</span>
                </button>
                <button
                  onClick={() => handleAttachmentMenuClick('emoticon')}
                  className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center space-x-4 text-lg"
                >
                  <Smile size={28} className="text-yellow-500" />
                  <span className="font-medium">Emoticon</span>
                </button>
                <button
                  onClick={() => handleAttachmentMenuClick('voting')}
                  className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center space-x-4 text-lg"
                >
                  <Vote size={28} className="text-purple-500" />
                  <span className="font-medium">Voting Poll</span>
                </button>
                <button
                  onClick={() => handleAttachmentMenuClick('graph')}
                  className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center space-x-4 text-lg"
                >
                  <BarChart3 size={28} className="text-green-500" />
                  <span className="font-medium">Graph/Chart</span>
                </button>
              </div>
            )}
          </div>

          {/* Send button - Large button for elderly */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={32} />
          </button>
        </div>
      </div>

      {/* Emoticon picker popup - Larger for elderly */}
      {showEmoticonPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
          <div className="bg-white border-2 rounded-xl shadow-xl p-6 w-96 max-w-sm pointer-events-auto emoticon-picker">
            <div className="mb-6">
              <h4 className="font-semibold text-2xl mb-4">Emoji</h4>
              <div className="grid grid-cols-5 gap-2">
                {emoticons.map((emoticon) => (
                  <button
                    key={emoticon}
                    onClick={() => handleEmoticonSelect(emoticon)}
                    className="p-3 hover:bg-gray-100 rounded-lg text-4xl"
                  >
                    {emoticon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-2xl mb-4">GIF Emoticons</h4>
              <div className="grid grid-cols-4 gap-3">
                {gifEmoticons.map((gif) => (
                  <button
                    key={gif.name}
                    onClick={() => handleGifEmoticonSelect(gif.path)}
                    className="p-3 hover:bg-gray-100 rounded-lg border-2"
                    title={gif.name}
                  >
                    <img
                      src={gif.path}
                      alt={gif.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.textContent = gif.name;
                          parent.className = 'p-3 hover:bg-gray-100 rounded-lg border-2 text-sm text-center';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowEmoticonPicker(false)}
              className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Voting options popup */}
      {showVotingOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
          <VotingCreator onCreate={handleVotingCreate} onClose={() => setShowVotingOptions(false)} />
        </div>
      )}

      {/* Graph creator popup */}
      {showGraphCreator && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
          <GraphCreator onCreate={handleGraphCreate} onClose={() => setShowGraphCreator(false)} />
        </div>
      )}
    </div>
  );
};

interface VotingCreatorProps {
  onCreate: (question: string, options: string[]) => void;
  onClose: () => void;
}

const VotingCreator: React.FC<VotingCreatorProps> = ({ onCreate, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreate = () => {
    if (question.trim() && options.filter(opt => opt.trim()).length >= 2) {
      onCreate(question.trim(), options.filter(opt => opt.trim()));
    }
  };

  return (
    <div className="bg-white border-2 rounded-xl shadow-xl p-6 w-96 max-w-md pointer-events-auto voting-creator">
      <h3 className="font-semibold text-2xl mb-4">Create Voting</h3>
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full p-4 text-lg border-2 rounded-lg mb-4"
      />
      <div className="space-y-3 mb-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 p-4 text-lg border-2 rounded-lg"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700 text-3xl font-bold px-3"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          onClick={addOption}
          className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-lg font-medium"
        >
          Add Option
        </button>
        <div className="space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
            className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-lg font-medium"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

interface GraphCreatorProps {
  onCreate: (title: string, data: { name: string; value: number }[]) => void;
  onClose: () => void;
}

const GraphCreator: React.FC<GraphCreatorProps> = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState('');
  const [dataPoints, setDataPoints] = useState([{ name: '', value: 0 }]);
  const [inputMode, setInputMode] = useState<'manual' | 'file'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { name: '', value: 0 }]);
  };

  const updateDataPoint = (index: number, field: 'name' | 'value', value: string | number) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index] = { ...newDataPoints[index], [field]: value };
    setDataPoints(newDataPoints);
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Papa.parse(file as any, {
        header: true,
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const parsedData = results.data;
            const graphData = (parsedData as Record<string, unknown>[])
              .filter((row) => row.name && row.value)
              .map((row) => ({
                name: String(row.name),
                value: parseFloat(String(row.value)) || 0
              }))
              .filter(point => point.name && !isNaN(point.value));

            if (graphData.length > 0) {
              setDataPoints(graphData);
              if (!title.trim()) {
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
              }
            } else {
              alert('No valid data found. Please ensure your CSV has "name" and "value" columns with valid data.');
            }
          } catch (error) {
            debugLog.error('GraphCreator', 'CSV parsing error', error as Error);
            alert('Error parsing CSV file. Please ensure it has "name" and "value" columns.');
          }
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const graphData = (jsonData as Record<string, unknown>[])
            .filter((row) => row.name && row.value)
            .map((row) => ({
              name: String(row.name),
              value: parseFloat(String(row.value)) || 0
            }))
            .filter(point => point.name && !isNaN(point.value));

          if (graphData.length > 0) {
            setDataPoints(graphData);
            if (!title.trim()) {
              setTitle(file.name.replace(/\.[^/.]+$/, ""));
            }
          }
        } catch (error) {
          debugLog.error('GraphCreator', 'Excel parsing error', error as Error);
          alert('Error parsing Excel file. Please ensure it has "name" and "value" columns.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCreate = () => {
    const validDataPoints = dataPoints.filter(point => point.name.trim() && point.value !== null && point.value !== undefined);
    if (title.trim() && validDataPoints.length >= 1) {
      onCreate(title.trim(), validDataPoints);
    }
  };

  return (
    <div className="bg-white border-2 rounded-xl shadow-xl p-6 w-[450px] max-w-md pointer-events-auto graph-creator">
      <h3 className="font-semibold text-2xl mb-4">Create Graph</h3>

      {/* Input mode selector - Larger for elderly */}
      <div className="flex mb-4 space-x-3">
        <button
          onClick={() => setInputMode('manual')}
          className={`px-5 py-3 rounded-lg text-lg font-medium ${inputMode === 'manual' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Manual Input
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`px-5 py-3 rounded-lg text-lg font-medium ${inputMode === 'file' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Upload File
        </button>
      </div>

      <input
        type="text"
        placeholder="Graph Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 text-lg border-2 rounded-lg mb-4"
      />

      {inputMode === 'manual' ? (
        <>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {dataPoints.map((point, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={point.name}
                  onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                  className="flex-1 p-3 text-lg border-2 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={point.value}
                  onChange={(e) => updateDataPoint(index, 'value', parseFloat(e.target.value) || 0)}
                  className="w-24 p-3 text-lg border-2 rounded-lg"
                />
                {dataPoints.length > 1 && (
                  <button
                    onClick={() => removeDataPoint(index)}
                    className="text-red-500 hover:text-red-700 text-3xl font-bold px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mb-4">
            <button
              onClick={addDataPoint}
              className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-lg font-medium"
            >
              Add Point
            </button>
          </div>
        </>
      ) : (
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="w-full p-3 text-lg border-2 rounded-lg"
          />
          <p className="text-base text-gray-600 mt-2">
            Upload a CSV or Excel file with &quot;name&quot; and &quot;value&quot; columns
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-lg font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || dataPoints.filter(point => point.name.trim()).length < 1}
          className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-lg font-medium"
        >
          Create
        </button>
      </div>
    </div>
  );
};
