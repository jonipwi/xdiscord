import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Paperclip, Smile, Vote, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { debugLog } from '../utils/debugLogger';

interface MessageContent {
  options?: string[];
  [key: string]: unknown;
}

interface ChatInputProps {
  onSendMessage: (message: string, type: string, content?: MessageContent) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  onSendImage?: (file: File) => void;
  onSendFile?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendVoice,
  onSendImage,
  onSendFile,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [showVotingOptions, setShowVotingOptions] = useState(false);
  const [showGraphCreator, setShowGraphCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
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
  }, [showEmoticonPicker, showVotingOptions, showGraphCreator]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      debugLog.info('ChatInput', 'Sending text message', {
        message_length: message.trim().length,
        message_preview: message.trim().substring(0, 50),
      });
      onSendMessage(message.trim(), 'text');
      setMessage('');
    } else {
      debugLog.warn('ChatInput', 'Send attempted but blocked', {
        message_empty: !message.trim(),
        component_disabled: disabled,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      debugLog.debug('ChatInput', 'Enter key pressed, sending message');
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      debugLog.info('ChatInput', 'Stopping voice recording');
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      debugLog.info('ChatInput', 'Starting voice recording');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          debugLog.debug('ChatInput', 'Voice recording data chunk received', {
            chunk_size: e.data.size,
          });
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          debugLog.info('ChatInput', 'Voice recording completed', {
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
        debugLog.error('ChatInput', 'Failed to start voice recording', error as Error, {
          error_type: (error as Error).name,
        });
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handleFileSelect = (type: 'image' | 'file') => {
    debugLog.debug('ChatInput', 'File selection triggered', { type });
    const inputRef = type === 'image' ? imageInputRef : fileInputRef;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      debugLog.info('ChatInput', 'File selected for upload', {
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
      debugLog.warn('ChatInput', 'File input change triggered but no file selected', { type });
    }
    e.target.value = '';
  };

  const handleEmoticonSelect = (emoticon: string) => {
    debugLog.info('ChatInput', 'Emoticon selected', { emoticon });
    onSendMessage(emoticon, 'emoticon');
    setShowEmoticonPicker(false);
  };

  const handleGifEmoticonSelect = (gifPath: string) => {
    debugLog.info('ChatInput', 'GIF emoticon selected', { gifPath });
    onSendMessage(gifPath, 'gif_emoticon');
    setShowEmoticonPicker(false);
  };

  const handleVotingCreate = (question: string, options: string[]) => {
    debugLog.info('ChatInput', 'Voting poll created', {
      question,
      options_count: options.length,
      options,
    });
    onSendMessage(question, 'voting', { options });
    setShowVotingOptions(false);
  };

  const handleGraphCreate = (title: string, data: { name: string; value: number }[]) => {
    debugLog.info('ChatInput', 'Graph created', {
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
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-black text-white placeholder-gray-400"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
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

        <div className="flex items-center space-x-1">
          {/* Voice recording */}
          <button
            onClick={handleVoiceRecord}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-500 hover:bg-gray-100'
            } disabled:opacity-50`}
            title={isRecording ? 'Stop recording' : 'Record voice'}
          >
            <Mic size={20} />
          </button>

          {/* Image upload */}
          <button
            onClick={() => handleFileSelect('image')}
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Send image"
          >
            <ImageIcon size={20} />
          </button>

          {/* File upload */}
          <button
            onClick={() => handleFileSelect('file')}
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Send file"
          >
            <Paperclip size={20} />
          </button>

          {/* Emoticon picker */}
          <button
            onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Add emoticon"
          >
            <Smile size={20} />
          </button>

          {/* Voting */}
          <button
            onClick={() => setShowVotingOptions(!showVotingOptions)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Create voting"
          >
            <Vote size={20} />
          </button>

          {/* Graph */}
          <button
            onClick={() => setShowGraphCreator(!showGraphCreator)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Create graph"
          >
            <BarChart3 size={20} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Emoticon picker popup */}
      {showEmoticonPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
          <div className="bg-white border rounded-lg shadow-lg p-4 w-80 max-w-sm pointer-events-auto emoticon-picker">
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Emoji</h4>
              <div className="grid grid-cols-5 gap-1">
                {emoticons.map((emoticon) => (
                  <button
                    key={emoticon}
                    onClick={() => handleEmoticonSelect(emoticon)}
                    className="p-2 hover:bg-gray-100 rounded text-xl"
                  >
                    {emoticon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">GIF Emoticons</h4>
              <div className="grid grid-cols-4 gap-2">
                {gifEmoticons.map((gif) => (
                  <button
                    key={gif.name}
                    onClick={() => handleGifEmoticonSelect(gif.path)}
                    className="p-2 hover:bg-gray-100 rounded border"
                    title={gif.name}
                  >
                    <img
                      src={gif.path}
                      alt={gif.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback to text if GIF fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.textContent = gif.name;
                          parent.className = 'p-2 hover:bg-gray-100 rounded border text-xs text-center';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
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
    <div className="bg-white border rounded-lg shadow-lg p-4 w-80 max-w-sm pointer-events-auto voting-creator">
      <h3 className="font-semibold mb-3">Create Voting</h3>
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full p-2 border rounded mb-3 bg-black text-white placeholder-gray-400"
      />
      <div className="space-y-2 mb-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 p-2 border rounded bg-black text-white placeholder-gray-400"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700"
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
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Add Option
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
    <div className="bg-white border rounded-lg shadow-lg p-4 w-96 max-w-md pointer-events-auto graph-creator">
      <h3 className="font-semibold mb-3">Create Graph</h3>

      {/* Input mode selector */}
      <div className="flex mb-3 space-x-2">
        <button
          onClick={() => setInputMode('manual')}
          className={`px-3 py-1 rounded ${inputMode === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Manual Input
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`px-3 py-1 rounded ${inputMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Upload File
        </button>
      </div>

      <input
        type="text"
        placeholder="Graph Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      {inputMode === 'manual' ? (
        <>
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {dataPoints.map((point, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={point.name}
                  onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={point.value}
                  onChange={(e) => updateDataPoint(index, 'value', parseFloat(e.target.value) || 0)}
                  className="w-20 p-2 border rounded"
                />
                {dataPoints.length > 1 && (
                  <button
                    onClick={() => removeDataPoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mb-3">
            <button
              onClick={addDataPoint}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Add Point
            </button>
          </div>
        </>
      ) : (
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-600 mt-1">
            Upload a CSV or Excel file with &quot;name&quot; and &quot;value&quot; columns
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || dataPoints.filter(point => point.name.trim()).length < 1}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </div>
  );
};