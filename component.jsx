import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Settings, Eye, Copy, Edit, Heart, Zap, Palette, MessageSquare, Code, Database, Tv, MessageCircle, User, ChevronDown, ChevronRight, MoreVertical, Star, Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';

const PromptManager = () => {
  // Estados principais - sem cache local
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);

  // Estados da interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sortBy, setSortBy] = useState('Mais Recentes');
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(true);
  const [expandedModels, setExpandedModels] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newModel, setNewModel] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [activeSidebarDropdown, setActiveSidebarDropdown] = useState(null);

  // Configuração do Supabase (fixa)
  const [supabaseConfig] = useState({
    url: "https://ivumtyhdkjurerknjnpt.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dW10eWhka2p1cmVya25qbnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjUyMjMsImV4cCI6MjA2NTk0MTIyM30.rbkqMbSYczGbJdGSjUvARGLIU3Gf-B9q0RWm0vW99Bs"
  });
  
  // Estados do Supabase
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);

  const [newPrompt, setNewPrompt] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    model: ''
  });

  // Cliente Supabase
  const createSupabaseClient = () => {
    if (!supabaseConfig) return null;
    
    const client = {
      url: supabaseConfig.url,
      key: supabaseConfig.key,
      
      from(table) {
        const baseUrl = `${client.url}/rest/v1/${table}`;
        const headers = {
          'apikey': client.key,
          'Authorization': `Bearer ${client.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        };

        const tableClient = {
          async select(columns = '*') {
            try {
              console.log(`🔍 SELECT ${table}:`, `${baseUrl}?select=${columns}`);
              const response = await fetch(`${baseUrl}?select=${columns}`, {
                headers: { ...headers, 'Prefer': 'return=representation' }
              });
              
              console.log(`📊 SELECT ${table} status:`, response.status);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ SELECT ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              
              const data = await response.json();
              console.log(`📋 SELECT ${table} response:`, data);
              
              return { data: data, error: null };
            } catch (error) {
              console.error(`❌ SELECT ${table} error:`, error);
              return { data: null, error };
            }
          },

          async insert(data) {
            try {
              console.log(`➕ INSERT ${table}:`, data);
              const response = await fetch(baseUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(Array.isArray(data) ? data : [data])
              });
              
              console.log(`📊 INSERT ${table} status:`, response.status);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ INSERT ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              
              const result = await response.json();
              console.log(`📋 INSERT ${table} response:`, result);
              
              return { data: result, error: null };
            } catch (error) {
              console.error(`❌ INSERT ${table} error:`, error);
              return { data: null, error };
            }
          },

          async update(data) {
            try {
              const response = await fetch(baseUrl, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data)
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ UPDATE ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              
              const result = await response.json();
              return { data: result, error: null };
            } catch (error) {
              console.error(`❌ UPDATE ${table} error:`, error);
              return { data: null, error };
            }
          },

          eq(column, value) {
            return {
              async update(data) {
                try {
                  console.log(`✏️ UPDATE ${table} WHERE ${column}=${value}:`, data);
                  const response = await fetch(`${baseUrl}?${column}=eq.${value}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(data)
                  });
                  
                  console.log(`📊 UPDATE ${table} status:`, response.status);
                  
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ UPDATE ${table} error response:`, errorText);
                    return { data: null, error: { message: errorText, status: response.status } };
                  }
                  
                  const result = await response.json();
                  console.log(`📋 UPDATE ${table} response:`, result);
                  
                  return { data: result, error: null };
                } catch (error) {
                  console.error(`❌ UPDATE ${table} error:`, error);
                  return { data: null, error };
                }
              },

              async delete() {
                try {
                  console.log(`🗑️ DELETE ${table} WHERE ${column}=${value}`);
                  const response = await fetch(`${baseUrl}?${column}=eq.${value}`, {
                    method: 'DELETE',
                    headers
                  });
                  
                  console.log(`📊 DELETE ${table} status:`, response.status);
                  
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ DELETE ${table} error response:`, errorText);
                    return { data: null, error: { message: errorText, status: response.status } };
                  }
                  
                  const result = response.ok ? {} : await response.json();
                  console.log(`📋 DELETE ${table} response:`, result);
                  
                  return { data: result, error: null };
                } catch (error) {
                  console.error(`❌ DELETE ${table} error:`, error);
                  return { data: null, error };
                }
              }
            };
          }
        };
        
        return tableClient;
      }
    };
    
    return client;
  };

  // Testar conexão com Supabase
  const testSupabaseConnection = async (url, key) => {
    try {
      console.log('🔄 Testando conexão com Supabase...');
      console.log('📍 URL:', url);
      console.log('🔑 Key length:', key?.length || 0);
      
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status da conexão:', response.status);
      
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  };

  // Carregar dados do Supabase
  const syncFromSupabase = async () => {
    if (!supabaseConfig || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    const client = createSupabaseClient();
    
    if (!client) {
      console.error('❌ Cliente Supabase não configurado');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return;
    }
    
    try {
      console.log('🔄 Carregando dados do Supabase...');
      
      // Carregar categorias
      console.log('📂 Buscando categorias...');
      const { data: categoriesData, error: categoriesError } = await client.from('prompts_categories').select('*');
      if (categoriesError) {
        console.error('❌ Erro ao buscar categorias:', categoriesError);
      } else if (categoriesData && categoriesData.length > 0) {
        const mappedCategories = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          bgColor: cat.bg_color,
          textColor: cat.text_color,
          borderColor: cat.border_color
        }));
        setCategories(mappedCategories);
        console.log('✅ Categorias carregadas:', mappedCategories.length);
      }

      // Carregar modelos
      console.log('🤖 Buscando modelos...');
      const { data: modelsData, error: modelsError } = await client.from('prompts_models').select('*');
      if (modelsError) {
        console.error('❌ Erro ao buscar modelos:', modelsError);
      } else if (modelsData && modelsData.length > 0) {
        const mappedModels = modelsData.map(model => ({
          id: model.id,
          name: model.name,
          iconName: model.icon_name || 'Code',
          color: model.color,
          bgColor: model.bg_color,
          textColor: model.text_color,
          borderColor: model.border_color
        }));
        setModels(mappedModels);
        console.log('✅ Modelos carregados:', mappedModels.length);
      }

      // Carregar prompts
      console.log('📝 Buscando prompts...');
      const { data: promptsData, error: promptsError } = await client.from('prompts_prompts').select('*');
      if (promptsError) {
        console.error('❌ Erro ao buscar prompts:', promptsError);
      } else if (promptsData && promptsData.length > 0) {
        const mappedPrompts = promptsData.map(prompt => ({
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          category: prompt.category,
          model: prompt.model,
          createdAt: prompt.created_at,
          liked: prompt.liked || false,
          author: prompt.author
        }));
        setPrompts(mappedPrompts);
        console.log('✅ Prompts carregados:', mappedPrompts.length);
      }

      console.log('🎉 Dados carregados do Supabase com sucesso!');
      setLastSync(new Date().toISOString());
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
      
    } catch (error) {
      console.error('💥 Erro ao carregar dados:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Inicialização - carregar dados automaticamente
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🔄 Inicializando aplicação...');
      const connected = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.key);
      setSupabaseConnected(connected);
      
      if (connected) {
        console.log('✅ Conectado ao Supabase!');
        await syncFromSupabase();
      } else {
        console.log('❌ Falha na conexão com Supabase');
      }
    };
    
    initializeApp();
  }, []);

  // Funções CRUD com salvamento automático no Supabase

  const handleLikePrompt = async (promptId) => {
    const currentPrompt = prompts.find(p => p.id === promptId);
    if (!currentPrompt) return;
    
    const updatedPrompt = { ...currentPrompt, liked: !currentPrompt.liked };
    
    // Atualizar UI imediatamente
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? updatedPrompt : p
    ));
    
    // Salvar no Supabase
    if (supabaseConnected) {
      const client = createSupabaseClient();
      if (client) {
        console.log('💾 Salvando like no Supabase...');
        await client.from('prompts_prompts')
          .eq('id', promptId)
          .update({ liked: updatedPrompt.liked });
        setLastSync(new Date().toISOString());
      }
    }
  };

  const handleAddPrompt = async () => {
    if (newPrompt.title && newPrompt.content) {
      const prompt = {
        id: Date.now().toString(),
        ...newPrompt,
        createdAt: new Date().toISOString(),
        liked: false,
        author: newPrompt.model || 'USER'
      };
      
      // Atualizar UI imediatamente
      setPrompts(prev => [prompt, ...prev]);
      setNewPrompt({ title: '', description: '', content: '', category: '', model: '' });
      setShowNewPrompt(false);
      setEditingPrompt(null);
      
      // Salvar no Supabase
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log('💾 Salvando novo prompt no Supabase...');
          const promptData = {
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            category: prompt.category,
            model: prompt.model,
            created_at: prompt.createdAt,
            liked: prompt.liked,
            author: prompt.author,
            user_id: 'user_default'
          };
          await client.from('prompts_prompts').insert([promptData]);
          setLastSync(new Date().toISOString());
        }
      }
    }
  };

  const handleUpdatePrompt = async () => {
    if (editingPrompt && newPrompt.title && newPrompt.content) {
      const updatedPrompt = { ...editingPrompt, ...newPrompt };
      
      // Atualizar UI imediatamente
      setPrompts(prev => prev.map(p => 
        p.id === editingPrompt.id ? updatedPrompt : p
      ));
      setEditingPrompt(null);
      setNewPrompt({ title: '', description: '', content: '', category: '', model: '' });
      setShowNewPrompt(false);
      
      // Salvar no Supabase
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log('💾 Salvando prompt editado no Supabase...');
          const promptData = {
            title: updatedPrompt.title,
            description: updatedPrompt.description,
            content: updatedPrompt.content,
            category: updatedPrompt.category,
            model: updatedPrompt.model
          };
          await client.from('prompts_prompts')
            .eq('id', updatedPrompt.id)
            .update(promptData);
          setLastSync(new Date().toISOString());
        }
      }
    }
  };

  const handleDeletePrompt = async (promptId) => {
    // Atualizar UI imediatamente
    setPrompts(prev => prev.filter(p => p.id !== promptId));
    
    // Deletar do Supabase
    if (supabaseConnected) {
      const client = createSupabaseClient();
      if (client) {
        console.log('💾 Deletando prompt do Supabase...');
        await client.from('prompts_prompts')
          .eq('id', promptId)
          .delete();
        setLastSync(new Date().toISOString());
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      if (editingCategory) {
        // Editar categoria existente
        const updatedCategory = { ...editingCategory, name: newCategory };
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
        
        // Salvar no Supabase
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log('💾 Salvando categoria editada no Supabase...');
            await client.from('prompts_categories')
              .eq('id', updatedCategory.id)
              .update({ name: updatedCategory.name });
            setLastSync(new Date().toISOString());
          }
        }
      } else {
        // Adicionar nova categoria
        const categoryId = newCategory.toLowerCase().replace(/\s+/g, '-');
        const colors = ['red', 'blue', 'purple', 'green', 'yellow', 'pink', 'cyan', 'orange', 'emerald', 'indigo'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const category = {
          id: categoryId,
          name: newCategory,
          color: randomColor,
          bgColor: `bg-${randomColor}-500/20`,
          textColor: `text-${randomColor}-400`,
          borderColor: `border-${randomColor}-500/50`
        };
        setCategories(prev => [...prev, category]);
        
        // Salvar no Supabase
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log('💾 Salvando nova categoria no Supabase...');
            const categoryData = {
              id: category.id,
              name: category.name,
              color: category.color,
              bg_color: category.bgColor,
              text_color: category.textColor,
              border_color: category.borderColor,
              user_id: 'user_default'
            };
            await client.from('prompts_categories').insert([categoryData]);
            setLastSync(new Date().toISOString());
          }
        }
      }
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleAddModel = async () => {
    if (newModel.trim()) {
      if (editingModel) {
        // Editar modelo existente
        const updatedModel = { ...editingModel, name: newModel.toUpperCase() };
        setModels(prev => prev.map(model => 
          model.id === editingModel.id ? updatedModel : model
        ));
        setEditingModel(null);
        
        // Salvar no Supabase
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log('💾 Salvando modelo editado no Supabase...');
            await client.from('prompts_models')
              .eq('id', updatedModel.id)
              .update({ name: updatedModel.name });
            setLastSync(new Date().toISOString());
          }
        }
      } else {
        // Adicionar novo modelo
        const modelId = newModel.toLowerCase().replace(/\s+/g, '-');
        const colors = ['red', 'blue', 'purple', 'green', 'yellow', 'pink', 'cyan', 'orange', 'emerald', 'indigo'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const model = {
          id: modelId,
          name: newModel.toUpperCase(),
          iconName: 'Code',
          color: randomColor,
          bgColor: `bg-${randomColor}-500/20`,
          textColor: `text-${randomColor}-400`,
          borderColor: `border-${randomColor}-500/50`
        };
        setModels(prev => [...prev, model]);
        
        // Salvar no Supabase
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log('💾 Salvando novo modelo no Supabase...');
            const modelData = {
              id: model.id,
              name: model.name,
              icon_name: model.iconName,
              color: model.color,
              bg_color: model.bgColor,
              text_color: model.textColor,
              border_color: model.borderColor,
              user_id: 'user_default'
            };
            await client.from('prompts_models').insert([modelData]);
            setLastSync(new Date().toISOString());
          }
        }
      }
      setNewModel('');
      setShowAddModel(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setActiveSidebarDropdown(null);
      
      // Deletar do Supabase
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log('💾 Deletando categoria do Supabase...');
          await client.from('prompts_categories')
            .eq('id', categoryId)
            .delete();
          setLastSync(new Date().toISOString());
        }
      }
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
      setModels(prev => prev.filter(model => model.id !== modelId));
      setActiveSidebarDropdown(null);
      
      // Deletar do Supabase
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log('💾 Deletando modelo do Supabase...');
          await client.from('prompts_models')
            .eq('id', modelId)
            .delete();
          setLastSync(new Date().toISOString());
        }
      }
    }
  };

  // Funções auxiliares
  const getCategoryCount = (categoryName) => {
    return prompts.filter(p => p.category === categoryName).length;
  };

  const getModelCount = (modelName) => {
    return prompts.filter(p => p.model === modelName).length;
  };

  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
      const matchesModel = !selectedModel || prompt.model === selectedModel;
      const matchesFavorites = !showFavoritesOnly || prompt.liked;
      
      return matchesSearch && matchesCategory && matchesModel && matchesFavorites;
    });

    if (sortBy === 'Mais Recentes') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Mais Antigos') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'Alfabética') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [prompts, searchTerm, selectedCategory, selectedModel, sortBy, showFavoritesOnly]);

  const getModelIcon = (modelName) => {
    const model = models.find(m => m.name === modelName);
    const iconName = model ? model.iconName : 'Code';
    
    const iconMap = {
      'Zap': Zap,
      'Palette': Palette,
      'MessageSquare': MessageSquare,
      'Code': Code,
      'Heart': Heart,
      'Database': Database,
      'User': User,
      'Settings': Settings
    };
    
    return iconMap[iconName] || Code;
  };

  const getModelColor = (modelName) => {
    const model = models.find(m => m.name === modelName);
    return model ? model.textColor : 'text-gray-500';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.textColor : 'text-gray-400';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Atualizado há cerca de ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Atualizado há ${diffInDays} dias`;
    }
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt.content);
    setCopyFeedback('Conteúdo copiado!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setNewPrompt({
      title: prompt.title || '',
      description: prompt.description || '',
      content: prompt.content || '',
      category: prompt.category || '',
      model: prompt.model || ''
    });
    setShowNewPrompt(true);
  };

  const PromptCard = ({ prompt }) => (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 relative flex flex-col h-full group"
    >
      <div className="flex items-start justify-between mb-3 flex-1">
        <div className="flex-1 pr-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors">{prompt.title}</h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikePrompt(prompt.id);
                }}
                className={`p-2 rounded-full transition-all duration-200 ${
                  prompt.liked 
                    ? 'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20' 
                    : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Heart size={14} fill={prompt.liked ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button 
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === prompt.id ? null : prompt.id);
                  }}
                >
                  <MoreVertical size={14} />
                </button>
              
              {activeDropdown === prompt.id && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl py-3 shadow-2xl z-[9999] animate-in slide-in-from-top-2 duration-200"
                  style={{ minWidth: '180px' }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPrompt(prompt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
                  >
                    <Edit size={12} />
                    Editar
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPrompt(prompt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
                  >
                    <Eye size={12} />
                    Visualizar
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(prompt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
                  >
                    <Copy size={12} />
                    Copiar
                  </button>
                  <div className="border-t-2 border-gray-400 my-1"></div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Tem certeza que deseja excluir este prompt?')) {
                        handleDeletePrompt(prompt.id);
                      }
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-bold flex items-center gap-3 transition-colors"
                  >
                    <span>🗑️</span>
                    Excluir
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{prompt.description}</p>
          
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
              models.find(m => m.name === prompt.model)?.bgColor || 'bg-gray-700/50'
            } ${
              models.find(m => m.name === prompt.model)?.borderColor || 'border-gray-600'
            } ${getModelColor(prompt.model)}`}>
              {React.createElement(getModelIcon(prompt.model), { size: 12 })}
              <span className="text-xs font-medium">{prompt.model}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border ${
              categories.find(c => c.name === prompt.category)?.bgColor || 'bg-gray-700/50'
            } ${
              categories.find(c => c.name === prompt.category)?.borderColor || 'border-gray-600'
            } ${getCategoryColor(prompt.category)}`}>
              {prompt.category}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <p className="text-gray-500 text-xs">{formatTimeAgo(prompt.createdAt)}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditPrompt(prompt);
          }}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPrompt(prompt);
          }}
          className="p-2.5 border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
        >
          <Eye size={14} className="text-gray-400 hover:text-gray-300" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyPrompt(prompt);
          }}
          className="p-2.5 border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
        >
          <Copy size={14} className="text-gray-400 hover:text-gray-300" />
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white"
      onClick={(e) => {
        if (activeDropdown) {
          setActiveDropdown(null);
        }
        if (activeSidebarDropdown) {
          setActiveSidebarDropdown(null);
        }
      }}
    >
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Settings size={16} />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code size={16} />
            </div>
            <h1 className="text-lg font-semibold hidden sm:block">Gerenciador de Prompts IA</h1>
            <h1 className="text-sm font-semibold sm:hidden">Prompts IA</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option>Mais Recentes</option>
                <option>Mais Antigos</option>
                <option>Alfabética</option>
              </select>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                showFavoritesOnly 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Heart size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Favoritos</span>
            </button>



            <button
              onClick={() => setShowNewPrompt(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Novo Prompt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-800 via-gray-850 to-gray-900 border-r border-gray-700/30 p-4 min-h-screen overflow-y-auto hidden md:block backdrop-blur-sm">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/40 border border-gray-600/50 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-gray-700/60 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Categories */}
          <div className="mb-4">
            <button
              onClick={() => setExpandedCategories(!expandedCategories)}
              className="flex items-center justify-between w-full text-left mb-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Categorias</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddCategory(true);
                  }}
                  className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-1 rounded-full transition-all"
                >
                  <Plus size={12} />
                </button>
                {expandedCategories ? <ChevronDown size={12} className="group-hover:text-blue-400 transition-colors" /> : <ChevronRight size={12} className="group-hover:text-blue-400 transition-colors" />}
              </div>
            </button>
            
            {expandedCategories && (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    !selectedCategory 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!selectedCategory ? 'bg-white' : 'bg-gray-500'}`}></div>
                    <span className="font-medium">Todas as categorias</span>
                  </div>
                </button>
                {categories.map(category => (
                  <div key={category.id} className="relative">
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group border ${
                        selectedCategory === category.name 
                          ? `${category.bgColor} ${category.textColor} ${category.borderColor} shadow-lg` 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all ${selectedCategory === category.name ? 'bg-current' : category.textColor.replace('text-', 'bg-')}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full transition-all ${
                          selectedCategory === category.name 
                            ? 'bg-current/20 text-current' 
                            : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                        }`}>
                          {getCategoryCount(category.name)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSidebarDropdown(activeSidebarDropdown === `cat-${category.id}` ? null : `cat-${category.id}`);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-all"
                        >
                          <MoreVertical size={10} />
                        </button>
                      </div>
                    </button>
                    
                    {activeSidebarDropdown === `cat-${category.id}` && (
                      <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg py-1 shadow-lg z-50" style={{ minWidth: '120px' }}>
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setNewCategory(category.name);
                            setShowAddCategory(true);
                            setActiveSidebarDropdown(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-gray-700 flex items-center gap-2"
                        >
                          <Edit size={10} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <span>🗑️</span>
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Models */}
          <div>
            <button
              onClick={() => setExpandedModels(!expandedModels)}
              className="flex items-center justify-between w-full text-left mb-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Modelos de IA</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddModel(true);
                  }}
                  className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 p-1 rounded-full transition-all"
                >
                  <Plus size={12} />
                </button>
                {expandedModels ? <ChevronDown size={12} className="group-hover:text-purple-400 transition-colors" /> : <ChevronRight size={12} className="group-hover:text-purple-400 transition-colors" />}
              </div>
            </button>
            
            {expandedModels && (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedModel('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    !selectedModel 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!selectedModel ? 'bg-white' : 'bg-gray-500'}`}></div>
                    <span className="font-medium">Todos os modelos</span>
                  </div>
                </button>
                {models.map(model => (
                  <div key={model.id} className="relative">
                    <button
                      onClick={() => setSelectedModel(model.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group border ${
                        selectedModel === model.name 
                          ? `${model.bgColor} ${model.textColor} ${model.borderColor} shadow-lg` 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {React.createElement(getModelIcon(model.name), { 
                          size: 12, 
                          className: `transition-all ${selectedModel === model.name ? 'text-current' : model.textColor}` 
                        })}
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full transition-all ${
                          selectedModel === model.name 
                            ? 'bg-current/20 text-current' 
                            : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                        }`}>
                          {getModelCount(model.name)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSidebarDropdown(activeSidebarDropdown === `mod-${model.id}` ? null : `mod-${model.id}`);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-all"
                        >
                          <MoreVertical size={10} />
                        </button>
                      </div>
                    </button>
                    
                    {activeSidebarDropdown === `mod-${model.id}` && (
                      <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg py-1 shadow-lg z-50" style={{ minWidth: '120px' }}>
                        <button
                          onClick={() => {
                            setEditingModel(model);
                            setNewModel(model.name);
                            setShowAddModel(true);
                            setActiveSidebarDropdown(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-gray-700 flex items-center gap-2"
                        >
                          <Edit size={10} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <span>🗑️</span>
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {showFavoritesOnly ? `Prompts Favoritos (${filteredPrompts.length})` : `Meus Prompts (${filteredPrompts.length})`}
            </h2>

            {/* Status Messages */}
            <div className="flex items-center gap-4 mb-2">
              {copyFeedback && (
                <div className="bg-green-600 text-white px-3 py-1 rounded text-sm inline-block">
                  {copyFeedback}
                </div>
              )}
              
              {supabaseConnected ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Wifi size={12} className="text-green-400" />
                    <span>Conectado ao Supabase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Dados salvos automaticamente</span>
                  </div>
                  {lastSync && (
                    <span className="text-xs">
                      • Última sync: {new Date(lastSync).toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <WifiOff size={12} className="text-red-400" />
                    <span>Desconectado do Supabase - Dados não serão salvos</span>
                  </div>
                </div>
              )}
              
              {syncStatus === 'success' && (
                <div className="bg-green-600 text-white px-3 py-1 rounded text-sm inline-block">
                  Dados carregados com sucesso!
                </div>
              )}
              
              {syncStatus === 'error' && (
                <div className="bg-red-600 text-white px-3 py-1 rounded text-sm inline-block">
                  Erro ao carregar dados - Verifique o console
                </div>
              )}
            </div>
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 relative auto-rows-fr">
            {filteredPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {showFavoritesOnly ? 'Nenhum prompt favorito encontrado' : 'Nenhum prompt encontrado'}
              </p>
              {!supabaseConnected && (
                <p className="text-gray-500 text-sm mt-2">
                  Conecte-se ao Supabase para carregar seus dados
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Prompt Modal */}
      {showNewPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={newPrompt.description}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <select
                    value={newPrompt.model}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione um modelo</option>
                    {models.map(model => (
                      <option key={model.id} value={model.name}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo do Prompt</label>
                <textarea
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={editingPrompt ? handleUpdatePrompt : handleAddPrompt}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                {editingPrompt ? 'Salvar Alterações' : 'Criar Prompt'}
              </button>
              <button
                onClick={() => {
                  setShowNewPrompt(false);
                  setEditingPrompt(null);
                  setNewPrompt({ title: '', description: '', content: '', category: '', model: '' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Visualizar Prompt: {selectedPrompt.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(selectedPrompt)}
                  className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  <Copy size={14} />
                  Copiar
                </button>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Conteúdo do Prompt</h4>
              <pre className="bg-gray-900 border border-gray-600 rounded p-4 text-sm whitespace-pre-wrap overflow-x-auto">
                {selectedPrompt.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
            </h3>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                {editingCategory ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                  setEditingCategory(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingModel ? 'Editar Modelo' : 'Adicionar Modelo'}
            </h3>
            <input
              type="text"
              placeholder="Nome do modelo"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddModel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                {editingModel ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddModel(false);
                  setNewModel('');
                  setEditingModel(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start p-4 z-50 md:hidden">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option>Mais Recentes</option>
                <option>Mais Antigos</option>
                <option>Alfabética</option>
              </select>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Categorias</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                    !selectedCategory ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Todas as categorias
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === category.name ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs">{getCategoryCount(category.name)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Models */}
            <div>
              <h4 className="text-sm font-medium mb-2">Modelos</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedModel('');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                    !selectedModel ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Todos os modelos
                </button>
                {models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center justify-between ${
                      selectedModel === model.name ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(getModelIcon(model.name), { 
                        size: 12, 
                        className: getModelColor(model.name) 
                      })}
                      <span>{model.name}</span>
                    </div>
                    <span className="text-xs">{getModelCount(model.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManager;