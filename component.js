// <stdin>
import React, { useState, useEffect, useMemo } from "https://esm.sh/react@18.2.0";
import { Search, Plus, Settings, Eye, Copy, Edit, Heart, Zap, Palette, MessageSquare, Code, Database, Tv, MessageCircle, User, ChevronDown, ChevronRight, MoreVertical, Star, Cloud, CloudOff, Wifi, WifiOff } from "https://esm.sh/lucide-react?deps=react@18.2.0,react-dom@18.2.0";
var PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [sortBy, setSortBy] = useState("Mais Recentes");
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(true);
  const [expandedModels, setExpandedModels] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newModel, setNewModel] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [activeSidebarDropdown, setActiveSidebarDropdown] = useState(null);
  const [supabaseConfig] = useState({
    url: "https://ivumtyhdkjurerknjnpt.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dW10eWhka2p1cmVya25qbnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjUyMjMsImV4cCI6MjA2NTk0MTIyM30.rbkqMbSYczGbJdGSjUvARGLIU3Gf-B9q0RWm0vW99Bs"
  });
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSync, setLastSync] = useState(null);
  const [newPrompt, setNewPrompt] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    model: ""
  });
  const createSupabaseClient = () => {
    if (!supabaseConfig) return null;
    const client = {
      url: supabaseConfig.url,
      key: supabaseConfig.key,
      from(table) {
        const baseUrl = `${client.url}/rest/v1/${table}`;
        const headers = {
          "apikey": client.key,
          "Authorization": `Bearer ${client.key}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        };
        const tableClient = {
          async select(columns = "*") {
            try {
              console.log(`\u{1F50D} SELECT ${table}:`, `${baseUrl}?select=${columns}`);
              const response = await fetch(`${baseUrl}?select=${columns}`, {
                headers: { ...headers, "Prefer": "return=representation" }
              });
              console.log(`\u{1F4CA} SELECT ${table} status:`, response.status);
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`\u274C SELECT ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              const data = await response.json();
              console.log(`\u{1F4CB} SELECT ${table} response:`, data);
              return { data, error: null };
            } catch (error) {
              console.error(`\u274C SELECT ${table} error:`, error);
              return { data: null, error };
            }
          },
          async insert(data) {
            try {
              console.log(`\u2795 INSERT ${table}:`, data);
              const response = await fetch(baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(Array.isArray(data) ? data : [data])
              });
              console.log(`\u{1F4CA} INSERT ${table} status:`, response.status);
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`\u274C INSERT ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              const result = await response.json();
              console.log(`\u{1F4CB} INSERT ${table} response:`, result);
              return { data: result, error: null };
            } catch (error) {
              console.error(`\u274C INSERT ${table} error:`, error);
              return { data: null, error };
            }
          },
          async update(data) {
            try {
              const response = await fetch(baseUrl, {
                method: "PATCH",
                headers,
                body: JSON.stringify(data)
              });
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`\u274C UPDATE ${table} error response:`, errorText);
                return { data: null, error: { message: errorText, status: response.status } };
              }
              const result = await response.json();
              return { data: result, error: null };
            } catch (error) {
              console.error(`\u274C UPDATE ${table} error:`, error);
              return { data: null, error };
            }
          },
          eq(column, value) {
            return {
              async update(data) {
                try {
                  console.log(`\u270F\uFE0F UPDATE ${table} WHERE ${column}=${value}:`, data);
                  const response = await fetch(`${baseUrl}?${column}=eq.${value}`, {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(data)
                  });
                  console.log(`\u{1F4CA} UPDATE ${table} status:`, response.status);
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`\u274C UPDATE ${table} error response:`, errorText);
                    return { data: null, error: { message: errorText, status: response.status } };
                  }
                  const result = await response.json();
                  console.log(`\u{1F4CB} UPDATE ${table} response:`, result);
                  return { data: result, error: null };
                } catch (error) {
                  console.error(`\u274C UPDATE ${table} error:`, error);
                  return { data: null, error };
                }
              },
              async delete() {
                try {
                  console.log(`\u{1F5D1}\uFE0F DELETE ${table} WHERE ${column}=${value}`);
                  const response = await fetch(`${baseUrl}?${column}=eq.${value}`, {
                    method: "DELETE",
                    headers
                  });
                  console.log(`\u{1F4CA} DELETE ${table} status:`, response.status);
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`\u274C DELETE ${table} error response:`, errorText);
                    return { data: null, error: { message: errorText, status: response.status } };
                  }
                  const result = response.ok ? {} : await response.json();
                  console.log(`\u{1F4CB} DELETE ${table} response:`, result);
                  return { data: result, error: null };
                } catch (error) {
                  console.error(`\u274C DELETE ${table} error:`, error);
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
  const testSupabaseConnection = async (url, key) => {
    try {
      console.log("\u{1F504} Testando conex\xE3o com Supabase...");
      console.log("\u{1F4CD} URL:", url);
      console.log("\u{1F511} Key length:", key?.length || 0);
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        }
      });
      console.log("\u{1F4CA} Status da conex\xE3o:", response.status);
      return response.ok;
    } catch (error) {
      console.error("\u274C Erro ao testar conex\xE3o:", error);
      return false;
    }
  };
  const syncFromSupabase = async () => {
    if (!supabaseConfig || syncStatus === "syncing") return;
    setSyncStatus("syncing");
    const client = createSupabaseClient();
    if (!client) {
      console.error("\u274C Cliente Supabase n\xE3o configurado");
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3e3);
      return;
    }
    try {
      console.log("\u{1F504} Carregando dados do Supabase...");
      console.log("\u{1F4C2} Buscando categorias...");
      const { data: categoriesData, error: categoriesError } = await client.from("prompts_categories").select("*");
      if (categoriesError) {
        console.error("\u274C Erro ao buscar categorias:", categoriesError);
      } else if (categoriesData && categoriesData.length > 0) {
        const mappedCategories = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          bgColor: cat.bg_color,
          textColor: cat.text_color,
          borderColor: cat.border_color
        }));
        setCategories(mappedCategories);
        console.log("\u2705 Categorias carregadas:", mappedCategories.length);
      }
      console.log("\u{1F916} Buscando modelos...");
      const { data: modelsData, error: modelsError } = await client.from("prompts_models").select("*");
      if (modelsError) {
        console.error("\u274C Erro ao buscar modelos:", modelsError);
      } else if (modelsData && modelsData.length > 0) {
        const mappedModels = modelsData.map((model) => ({
          id: model.id,
          name: model.name,
          iconName: model.icon_name || "Code",
          color: model.color,
          bgColor: model.bg_color,
          textColor: model.text_color,
          borderColor: model.border_color
        }));
        setModels(mappedModels);
        console.log("\u2705 Modelos carregados:", mappedModels.length);
      }
      console.log("\u{1F4DD} Buscando prompts...");
      const { data: promptsData, error: promptsError } = await client.from("prompts_prompts").select("*");
      if (promptsError) {
        console.error("\u274C Erro ao buscar prompts:", promptsError);
      } else if (promptsData && promptsData.length > 0) {
        const mappedPrompts = promptsData.map((prompt) => ({
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
        console.log("\u2705 Prompts carregados:", mappedPrompts.length);
      }
      console.log("\u{1F389} Dados carregados do Supabase com sucesso!");
      setLastSync((/* @__PURE__ */ new Date()).toISOString());
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2e3);
    } catch (error) {
      console.error("\u{1F4A5} Erro ao carregar dados:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3e3);
    }
  };
  useEffect(() => {
    const initializeApp = async () => {
      console.log("\u{1F504} Inicializando aplica\xE7\xE3o...");
      const connected = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.key);
      setSupabaseConnected(connected);
      if (connected) {
        console.log("\u2705 Conectado ao Supabase!");
        await syncFromSupabase();
      } else {
        console.log("\u274C Falha na conex\xE3o com Supabase");
      }
    };
    initializeApp();
  }, []);
  const handleLikePrompt = async (promptId) => {
    const currentPrompt = prompts.find((p) => p.id === promptId);
    if (!currentPrompt) return;
    const updatedPrompt = { ...currentPrompt, liked: !currentPrompt.liked };
    setPrompts((prev) => prev.map(
      (p) => p.id === promptId ? updatedPrompt : p
    ));
    if (supabaseConnected) {
      const client = createSupabaseClient();
      if (client) {
        console.log("\u{1F4BE} Salvando like no Supabase...");
        await client.from("prompts_prompts").eq("id", promptId).update({ liked: updatedPrompt.liked });
        setLastSync((/* @__PURE__ */ new Date()).toISOString());
      }
    }
  };
  const handleAddPrompt = async () => {
    if (newPrompt.title && newPrompt.content) {
      const prompt = {
        id: Date.now().toString(),
        ...newPrompt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        liked: false,
        author: newPrompt.model || "USER"
      };
      setPrompts((prev) => [prompt, ...prev]);
      setNewPrompt({ title: "", description: "", content: "", category: "", model: "" });
      setShowNewPrompt(false);
      setEditingPrompt(null);
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log("\u{1F4BE} Salvando novo prompt no Supabase...");
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
            user_id: "user_default"
          };
          await client.from("prompts_prompts").insert([promptData]);
          setLastSync((/* @__PURE__ */ new Date()).toISOString());
        }
      }
    }
  };
  const handleUpdatePrompt = async () => {
    if (editingPrompt && newPrompt.title && newPrompt.content) {
      const updatedPrompt = { ...editingPrompt, ...newPrompt };
      setPrompts((prev) => prev.map(
        (p) => p.id === editingPrompt.id ? updatedPrompt : p
      ));
      setEditingPrompt(null);
      setNewPrompt({ title: "", description: "", content: "", category: "", model: "" });
      setShowNewPrompt(false);
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log("\u{1F4BE} Salvando prompt editado no Supabase...");
          const promptData = {
            title: updatedPrompt.title,
            description: updatedPrompt.description,
            content: updatedPrompt.content,
            category: updatedPrompt.category,
            model: updatedPrompt.model
          };
          await client.from("prompts_prompts").eq("id", updatedPrompt.id).update(promptData);
          setLastSync((/* @__PURE__ */ new Date()).toISOString());
        }
      }
    }
  };
  const handleDeletePrompt = async (promptId) => {
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    if (supabaseConnected) {
      const client = createSupabaseClient();
      if (client) {
        console.log("\u{1F4BE} Deletando prompt do Supabase...");
        await client.from("prompts_prompts").eq("id", promptId).delete();
        setLastSync((/* @__PURE__ */ new Date()).toISOString());
      }
    }
  };
  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      if (editingCategory) {
        const updatedCategory = { ...editingCategory, name: newCategory };
        setCategories((prev) => prev.map(
          (cat) => cat.id === editingCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log("\u{1F4BE} Salvando categoria editada no Supabase...");
            await client.from("prompts_categories").eq("id", updatedCategory.id).update({ name: updatedCategory.name });
            setLastSync((/* @__PURE__ */ new Date()).toISOString());
          }
        }
      } else {
        const categoryId = newCategory.toLowerCase().replace(/\s+/g, "-");
        const colors = ["red", "blue", "purple", "green", "yellow", "pink", "cyan", "orange", "emerald", "indigo"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const category = {
          id: categoryId,
          name: newCategory,
          color: randomColor,
          bgColor: `bg-${randomColor}-500/20`,
          textColor: `text-${randomColor}-400`,
          borderColor: `border-${randomColor}-500/50`
        };
        setCategories((prev) => [...prev, category]);
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log("\u{1F4BE} Salvando nova categoria no Supabase...");
            const categoryData = {
              id: category.id,
              name: category.name,
              color: category.color,
              bg_color: category.bgColor,
              text_color: category.textColor,
              border_color: category.borderColor,
              user_id: "user_default"
            };
            await client.from("prompts_categories").insert([categoryData]);
            setLastSync((/* @__PURE__ */ new Date()).toISOString());
          }
        }
      }
      setNewCategory("");
      setShowAddCategory(false);
    }
  };
  const handleAddModel = async () => {
    if (newModel.trim()) {
      if (editingModel) {
        const updatedModel = { ...editingModel, name: newModel.toUpperCase() };
        setModels((prev) => prev.map(
          (model) => model.id === editingModel.id ? updatedModel : model
        ));
        setEditingModel(null);
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log("\u{1F4BE} Salvando modelo editado no Supabase...");
            await client.from("prompts_models").eq("id", updatedModel.id).update({ name: updatedModel.name });
            setLastSync((/* @__PURE__ */ new Date()).toISOString());
          }
        }
      } else {
        const modelId = newModel.toLowerCase().replace(/\s+/g, "-");
        const colors = ["red", "blue", "purple", "green", "yellow", "pink", "cyan", "orange", "emerald", "indigo"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const model = {
          id: modelId,
          name: newModel.toUpperCase(),
          iconName: "Code",
          color: randomColor,
          bgColor: `bg-${randomColor}-500/20`,
          textColor: `text-${randomColor}-400`,
          borderColor: `border-${randomColor}-500/50`
        };
        setModels((prev) => [...prev, model]);
        if (supabaseConnected) {
          const client = createSupabaseClient();
          if (client) {
            console.log("\u{1F4BE} Salvando novo modelo no Supabase...");
            const modelData = {
              id: model.id,
              name: model.name,
              icon_name: model.iconName,
              color: model.color,
              bg_color: model.bgColor,
              text_color: model.textColor,
              border_color: model.borderColor,
              user_id: "user_default"
            };
            await client.from("prompts_models").insert([modelData]);
            setLastSync((/* @__PURE__ */ new Date()).toISOString());
          }
        }
      }
      setNewModel("");
      setShowAddModel(false);
    }
  };
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setActiveSidebarDropdown(null);
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log("\u{1F4BE} Deletando categoria do Supabase...");
          await client.from("prompts_categories").eq("id", categoryId).delete();
          setLastSync((/* @__PURE__ */ new Date()).toISOString());
        }
      }
    }
  };
  const handleDeleteModel = async (modelId) => {
    if (window.confirm("Tem certeza que deseja excluir este modelo?")) {
      setModels((prev) => prev.filter((model) => model.id !== modelId));
      setActiveSidebarDropdown(null);
      if (supabaseConnected) {
        const client = createSupabaseClient();
        if (client) {
          console.log("\u{1F4BE} Deletando modelo do Supabase...");
          await client.from("prompts_models").eq("id", modelId).delete();
          setLastSync((/* @__PURE__ */ new Date()).toISOString());
        }
      }
    }
  };
  const getCategoryCount = (categoryName) => {
    return prompts.filter((p) => p.category === categoryName).length;
  };
  const getModelCount = (modelName) => {
    return prompts.filter((p) => p.model === modelName).length;
  };
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter((prompt) => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) || prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
      const matchesModel = !selectedModel || prompt.model === selectedModel;
      const matchesFavorites = !showFavoritesOnly || prompt.liked;
      return matchesSearch && matchesCategory && matchesModel && matchesFavorites;
    });
    if (sortBy === "Mais Recentes") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Mais Antigos") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "Alfab\xE9tica") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [prompts, searchTerm, selectedCategory, selectedModel, sortBy, showFavoritesOnly]);
  const getModelIcon = (modelName) => {
    const model = models.find((m) => m.name === modelName);
    const iconName = model ? model.iconName : "Code";
    const iconMap = {
      "Zap": Zap,
      "Palette": Palette,
      "MessageSquare": MessageSquare,
      "Code": Code,
      "Heart": Heart,
      "Database": Database,
      "User": User,
      "Settings": Settings
    };
    return iconMap[iconName] || Code;
  };
  const getModelColor = (modelName) => {
    const model = models.find((m) => m.name === modelName);
    return model ? model.textColor : "text-gray-500";
  };
  const getCategoryColor = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return category ? category.textColor : "text-gray-400";
  };
  const formatTimeAgo = (dateString) => {
    const now = /* @__PURE__ */ new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1e3 * 60 * 60));
    if (diffInHours < 24) {
      return `Atualizado h\xE1 cerca de ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Atualizado h\xE1 ${diffInDays} dias`;
    }
  };
  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt.content);
    setCopyFeedback("Conte\xFAdo copiado!");
    setTimeout(() => setCopyFeedback(""), 2e3);
  };
  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setNewPrompt({
      title: prompt.title || "",
      description: prompt.description || "",
      content: prompt.content || "",
      category: prompt.category || "",
      model: prompt.model || ""
    });
    setShowNewPrompt(true);
  };
  const PromptCard = ({ prompt }) => /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 relative flex flex-col h-full group"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between mb-3 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 pr-4 flex flex-col h-full" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors" }, prompt.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          handleLikePrompt(prompt.id);
        },
        className: `p-2 rounded-full transition-all duration-200 ${prompt.liked ? "text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20" : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"}`
      },
      /* @__PURE__ */ React.createElement(Heart, { size: 14, fill: prompt.liked ? "currentColor" : "none" })
    ), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105",
        onClick: (e) => {
          e.stopPropagation();
          setActiveDropdown(activeDropdown === prompt.id ? null : prompt.id);
        }
      },
      /* @__PURE__ */ React.createElement(MoreVertical, { size: 14 })
    ), activeDropdown === prompt.id && /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl py-3 shadow-2xl z-[9999] animate-in slide-in-from-top-2 duration-200",
        style: { minWidth: "180px" }
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            handleEditPrompt(prompt);
            setActiveDropdown(null);
          },
          className: "w-full text-left px-4 py-3 text-sm hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
        },
        /* @__PURE__ */ React.createElement(Edit, { size: 12 }),
        "Editar"
      ),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            setSelectedPrompt(prompt);
            setActiveDropdown(null);
          },
          className: "w-full text-left px-4 py-3 text-sm hover:bg-green-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
        },
        /* @__PURE__ */ React.createElement(Eye, { size: 12 }),
        "Visualizar"
      ),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            handleCopyPrompt(prompt);
            setActiveDropdown(null);
          },
          className: "w-full text-left px-4 py-3 text-sm hover:bg-purple-50 text-gray-700 font-medium flex items-center gap-3 border-b border-gray-100 transition-colors"
        },
        /* @__PURE__ */ React.createElement(Copy, { size: 12 }),
        "Copiar"
      ),
      /* @__PURE__ */ React.createElement("div", { className: "border-t-2 border-gray-400 my-1" }),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            if (window.confirm("Tem certeza que deseja excluir este prompt?")) {
              handleDeletePrompt(prompt.id);
            }
            setActiveDropdown(null);
          },
          className: "w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-bold flex items-center gap-3 transition-colors"
        },
        /* @__PURE__ */ React.createElement("span", null, "\u{1F5D1}\uFE0F"),
        "Excluir"
      )
    )))), /* @__PURE__ */ React.createElement("p", { className: "text-gray-400 text-xs mb-3 line-clamp-2" }, prompt.description), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-1.5 px-2 py-1 rounded-full border ${models.find((m) => m.name === prompt.model)?.bgColor || "bg-gray-700/50"} ${models.find((m) => m.name === prompt.model)?.borderColor || "border-gray-600"} ${getModelColor(prompt.model)}` }, React.createElement(getModelIcon(prompt.model), { size: 12 }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, prompt.model)), /* @__PURE__ */ React.createElement("span", { className: `text-xs px-2 py-1 rounded-full border ${categories.find((c) => c.name === prompt.category)?.bgColor || "bg-gray-700/50"} ${categories.find((c) => c.name === prompt.category)?.borderColor || "border-gray-600"} ${getCategoryColor(prompt.category)}` }, prompt.category)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mt-auto" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 text-xs" }, formatTimeAgo(prompt.createdAt))))),
    /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700/50" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          handleEditPrompt(prompt);
        },
        className: "p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
      },
      /* @__PURE__ */ React.createElement(Edit, { size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          setSelectedPrompt(prompt);
        },
        className: "p-2.5 border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
      },
      /* @__PURE__ */ React.createElement(Eye, { size: 14, className: "text-gray-400 hover:text-gray-300" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          handleCopyPrompt(prompt);
        },
        className: "p-2.5 border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
      },
      /* @__PURE__ */ React.createElement(Copy, { size: 14, className: "text-gray-400 hover:text-gray-300" })
    ))
  );
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "min-h-screen bg-gray-900 text-white",
      onClick: (e) => {
        if (activeDropdown) {
          setActiveDropdown(null);
        }
        if (activeSidebarDropdown) {
          setActiveSidebarDropdown(null);
        }
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 border-b border-gray-700 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowMobileMenu(true),
        className: "md:hidden p-2 text-gray-400 hover:text-white"
      },
      /* @__PURE__ */ React.createElement(Settings, { size: 16 })
    ), /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Code, { size: 16 })), /* @__PURE__ */ React.createElement("h1", { className: "text-lg font-semibold hidden sm:block" }, "Gerenciador de Prompts IA"), /* @__PURE__ */ React.createElement("h1", { className: "text-sm font-semibold sm:hidden" }, "Prompts IA")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "hidden sm:flex items-center gap-2 text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Ordenar:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: sortBy,
        onChange: (e) => setSortBy(e.target.value),
        className: "bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
      },
      /* @__PURE__ */ React.createElement("option", null, "Mais Recentes"),
      /* @__PURE__ */ React.createElement("option", null, "Mais Antigos"),
      /* @__PURE__ */ React.createElement("option", null, "Alfab\xE9tica")
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowFavoritesOnly(!showFavoritesOnly),
        className: `px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${showFavoritesOnly ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`
      },
      /* @__PURE__ */ React.createElement(Heart, { size: 14, fill: showFavoritesOnly ? "currentColor" : "none" }),
      /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Favoritos")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowNewPrompt(true),
        className: "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
      },
      /* @__PURE__ */ React.createElement(Plus, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Novo Prompt")
    )))),
    /* @__PURE__ */ React.createElement("div", { className: "flex" }, /* @__PURE__ */ React.createElement("div", { className: "w-64 bg-gradient-to-b from-gray-800 via-gray-850 to-gray-900 border-r border-gray-700/30 p-4 min-h-screen overflow-y-auto hidden md:block backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "relative mb-4" }, /* @__PURE__ */ React.createElement(Search, { size: 16, className: "absolute left-3 top-2.5 text-gray-400" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Buscar prompts...",
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value),
        className: "w-full bg-gray-700/40 border border-gray-600/50 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-gray-700/60 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200 placeholder-gray-400"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setExpandedCategories(!expandedCategories),
        className: "flex items-center justify-between w-full text-left mb-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 bg-blue-500 rounded-full" }), /* @__PURE__ */ React.createElement("span", null, "Categorias")),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            setShowAddCategory(true);
          },
          className: "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-1 rounded-full transition-all"
        },
        /* @__PURE__ */ React.createElement(Plus, { size: 12 })
      ), expandedCategories ? /* @__PURE__ */ React.createElement(ChevronDown, { size: 12, className: "group-hover:text-blue-400 transition-colors" }) : /* @__PURE__ */ React.createElement(ChevronRight, { size: 12, className: "group-hover:text-blue-400 transition-colors" }))
    ), expandedCategories && /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedCategory(""),
        className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${!selectedCategory ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: `w-2 h-2 rounded-full ${!selectedCategory ? "bg-white" : "bg-gray-500"}` }), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Todas as categorias"))
    ), categories.map((category) => /* @__PURE__ */ React.createElement("div", { key: category.id, className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedCategory(category.name),
        className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group border ${selectedCategory === category.name ? `${category.bgColor} ${category.textColor} ${category.borderColor} shadow-lg` : "text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md border-transparent"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: `w-2 h-2 rounded-full transition-all ${selectedCategory === category.name ? "bg-current" : category.textColor.replace("text-", "bg-")}` }), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, category.name)),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: `text-xs px-1.5 py-0.5 rounded-full transition-all ${selectedCategory === category.name ? "bg-current/20 text-current" : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300"}` }, getCategoryCount(category.name)), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            setActiveSidebarDropdown(activeSidebarDropdown === `cat-${category.id}` ? null : `cat-${category.id}`);
          },
          className: "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-all"
        },
        /* @__PURE__ */ React.createElement(MoreVertical, { size: 10 })
      ))
    ), activeSidebarDropdown === `cat-${category.id}` && /* @__PURE__ */ React.createElement("div", { className: "absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg py-1 shadow-lg z-50", style: { minWidth: "120px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingCategory(category);
          setNewCategory(category.name);
          setShowAddCategory(true);
          setActiveSidebarDropdown(null);
        },
        className: "w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-gray-700 flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement(Edit, { size: 10 }),
      "Editar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteCategory(category.id),
        className: "w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement("span", null, "\u{1F5D1}\uFE0F"),
      "Excluir"
    )))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setExpandedModels(!expandedModels),
        className: "flex items-center justify-between w-full text-left mb-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 bg-purple-500 rounded-full" }), /* @__PURE__ */ React.createElement("span", null, "Modelos de IA")),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            setShowAddModel(true);
          },
          className: "text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 p-1 rounded-full transition-all"
        },
        /* @__PURE__ */ React.createElement(Plus, { size: 12 })
      ), expandedModels ? /* @__PURE__ */ React.createElement(ChevronDown, { size: 12, className: "group-hover:text-purple-400 transition-colors" }) : /* @__PURE__ */ React.createElement(ChevronRight, { size: 12, className: "group-hover:text-purple-400 transition-colors" }))
    ), expandedModels && /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedModel(""),
        className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${!selectedModel ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: `w-2 h-2 rounded-full ${!selectedModel ? "bg-white" : "bg-gray-500"}` }), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "Todos os modelos"))
    ), models.map((model) => /* @__PURE__ */ React.createElement("div", { key: model.id, className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedModel(model.name),
        className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group border ${selectedModel === model.name ? `${model.bgColor} ${model.textColor} ${model.borderColor} shadow-lg` : "text-gray-400 hover:text-white hover:bg-gray-700/40 hover:shadow-md border-transparent"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, React.createElement(getModelIcon(model.name), {
        size: 12,
        className: `transition-all ${selectedModel === model.name ? "text-current" : model.textColor}`
      }), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, model.name)),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: `text-xs px-1.5 py-0.5 rounded-full transition-all ${selectedModel === model.name ? "bg-current/20 text-current" : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300"}` }, getModelCount(model.name)), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            setActiveSidebarDropdown(activeSidebarDropdown === `mod-${model.id}` ? null : `mod-${model.id}`);
          },
          className: "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-all"
        },
        /* @__PURE__ */ React.createElement(MoreVertical, { size: 10 })
      ))
    ), activeSidebarDropdown === `mod-${model.id}` && /* @__PURE__ */ React.createElement("div", { className: "absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg py-1 shadow-lg z-50", style: { minWidth: "120px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingModel(model);
          setNewModel(model.name);
          setShowAddModel(true);
          setActiveSidebarDropdown(null);
        },
        className: "w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-gray-700 flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement(Edit, { size: 10 }),
      "Editar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteModel(model.id),
        className: "w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement("span", null, "\u{1F5D1}\uFE0F"),
      "Excluir"
    ))))))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 p-4 md:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-semibold mb-2" }, showFavoritesOnly ? `Prompts Favoritos (${filteredPrompts.length})` : `Meus Prompts (${filteredPrompts.length})`), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 mb-2" }, copyFeedback && /* @__PURE__ */ React.createElement("div", { className: "bg-green-600 text-white px-3 py-1 rounded text-sm inline-block" }, copyFeedback), supabaseConnected ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm text-gray-400" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Wifi, { size: 12, className: "text-green-400" }), /* @__PURE__ */ React.createElement("span", null, "Conectado ao Supabase")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 bg-green-400 rounded-full animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "Dados salvos automaticamente")), lastSync && /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u2022 \xDAltima sync: ", new Date(lastSync).toLocaleString())) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-sm text-gray-400" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(WifiOff, { size: 12, className: "text-red-400" }), /* @__PURE__ */ React.createElement("span", null, "Desconectado do Supabase - Dados n\xE3o ser\xE3o salvos"))), syncStatus === "success" && /* @__PURE__ */ React.createElement("div", { className: "bg-green-600 text-white px-3 py-1 rounded text-sm inline-block" }, "Dados carregados com sucesso!"), syncStatus === "error" && /* @__PURE__ */ React.createElement("div", { className: "bg-red-600 text-white px-3 py-1 rounded text-sm inline-block" }, "Erro ao carregar dados - Verifique o console"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 relative auto-rows-fr" }, filteredPrompts.map((prompt) => /* @__PURE__ */ React.createElement(PromptCard, { key: prompt.id, prompt }))), filteredPrompts.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-center py-12" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-400" }, showFavoritesOnly ? "Nenhum prompt favorito encontrado" : "Nenhum prompt encontrado"), !supabaseConnected && /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 text-sm mt-2" }, "Conecte-se ao Supabase para carregar seus dados")))),
    showNewPrompt && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 rounded-lg p-6 w-full max-w-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold mb-4" }, editingPrompt ? "Editar Prompt" : "Novo Prompt"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-1" }, "T\xEDtulo"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: newPrompt.title,
        onChange: (e) => setNewPrompt((prev) => ({ ...prev, title: e.target.value })),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Descri\xE7\xE3o"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: newPrompt.description,
        onChange: (e) => setNewPrompt((prev) => ({ ...prev, description: e.target.value })),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Categoria"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: newPrompt.category,
        onChange: (e) => setNewPrompt((prev) => ({ ...prev, category: e.target.value })),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione uma categoria"),
      categories.map((cat) => /* @__PURE__ */ React.createElement("option", { key: cat.id, value: cat.name }, cat.name))
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Modelo"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: newPrompt.model,
        onChange: (e) => setNewPrompt((prev) => ({ ...prev, model: e.target.value })),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione um modelo"),
      models.map((model) => /* @__PURE__ */ React.createElement("option", { key: model.id, value: model.name }, model.name))
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-1" }, "Conte\xFAdo do Prompt"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: newPrompt.content,
        onChange: (e) => setNewPrompt((prev) => ({ ...prev, content: e.target.value })),
        rows: 6,
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-6" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: editingPrompt ? handleUpdatePrompt : handleAddPrompt,
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
      },
      editingPrompt ? "Salvar Altera\xE7\xF5es" : "Criar Prompt"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setShowNewPrompt(false);
          setEditingPrompt(null);
          setNewPrompt({ title: "", description: "", content: "", category: "", model: "" });
        },
        className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
      },
      "Cancelar"
    )))),
    selectedPrompt && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold" }, "Visualizar Prompt: ", selectedPrompt.title), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleCopyPrompt(selectedPrompt),
        className: "flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
      },
      /* @__PURE__ */ React.createElement(Copy, { size: 14 }),
      "Copiar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedPrompt(null),
        className: "bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
      },
      "Fechar"
    ))), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Conte\xFAdo do Prompt"), /* @__PURE__ */ React.createElement("pre", { className: "bg-gray-900 border border-gray-600 rounded p-4 text-sm whitespace-pre-wrap overflow-x-auto" }, selectedPrompt.content)))),
    showAddCategory && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 rounded-lg p-6 w-full max-w-md" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold mb-4" }, editingCategory ? "Editar Categoria" : "Adicionar Categoria"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Nome da categoria",
        value: newCategory,
        onChange: (e) => setNewCategory(e.target.value),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleAddCategory,
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
      },
      editingCategory ? "Salvar" : "Adicionar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setShowAddCategory(false);
          setNewCategory("");
          setEditingCategory(null);
        },
        className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
      },
      "Cancelar"
    )))),
    showAddModel && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 rounded-lg p-6 w-full max-w-md" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold mb-4" }, editingModel ? "Editar Modelo" : "Adicionar Modelo"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Nome do modelo",
        value: newModel,
        onChange: (e) => setNewModel(e.target.value),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleAddModel,
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
      },
      editingModel ? "Salvar" : "Adicionar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setShowAddModel(false);
          setNewModel("");
          setEditingModel(null);
        },
        className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
      },
      "Cancelar"
    )))),
    showMobileMenu && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start p-4 z-50 md:hidden" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800 rounded-lg p-6 w-full max-w-sm h-full overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold" }, "Filtros"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowMobileMenu(false),
        className: "text-gray-400 hover:text-white"
      },
      "\u2715"
    )), /* @__PURE__ */ React.createElement("div", { className: "relative mb-6" }, /* @__PURE__ */ React.createElement(Search, { size: 16, className: "absolute left-3 top-2.5 text-gray-400" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Buscar prompts...",
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value),
        className: "w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium mb-2" }, "Ordenar por:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: sortBy,
        onChange: (e) => setSortBy(e.target.value),
        className: "w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
      },
      /* @__PURE__ */ React.createElement("option", null, "Mais Recentes"),
      /* @__PURE__ */ React.createElement("option", null, "Mais Antigos"),
      /* @__PURE__ */ React.createElement("option", null, "Alfab\xE9tica")
    )), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Categorias"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedCategory("");
          setShowMobileMenu(false);
        },
        className: `w-full text-left px-2 py-1 rounded text-sm transition-colors ${!selectedCategory ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`
      },
      "Todas as categorias"
    ), categories.map((category) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: category.id,
        onClick: () => {
          setSelectedCategory(category.name);
          setShowMobileMenu(false);
        },
        className: `w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center justify-between ${selectedCategory === category.name ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`
      },
      /* @__PURE__ */ React.createElement("span", null, category.name),
      /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, getCategoryCount(category.name))
    )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Modelos"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedModel("");
          setShowMobileMenu(false);
        },
        className: `w-full text-left px-2 py-1 rounded text-sm transition-colors ${!selectedModel ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`
      },
      "Todos os modelos"
    ), models.map((model) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: model.id,
        onClick: () => {
          setSelectedModel(model.name);
          setShowMobileMenu(false);
        },
        className: `w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-center justify-between ${selectedModel === model.name ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, React.createElement(getModelIcon(model.name), {
        size: 12,
        className: getModelColor(model.name)
      }), /* @__PURE__ */ React.createElement("span", null, model.name)),
      /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, getModelCount(model.name))
    ))))))
  );
};
var stdin_default = PromptManager;
export {
  stdin_default as default
};
