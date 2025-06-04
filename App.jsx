import React, { useState, useEffect, useCallback } from 'react';

// --- Configuração do Supabase ---
const supabaseUrl = 'https://cjxzztqzptlfpzohxttq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeHp6dHF6cHRsZnB6b2h4dHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzM4NDAsImV4cCI6MjA2MzI0OTg0MH0.xM8wITqZCj04vGlpJZ-7On6at6FGdRjCw0FOGGAa23U';
const SUPABASE_SCRIPT_ID = 'supabase-js-sdk';

// --- Ícones (SVG inline) ---
const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const PlusCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);


// --- Constantes ---
const STATUS_OPTIONS = ["Em Análise", "Aprovado", "Reprovado"]; 
const DEFAULT_STATUS = "Em Análise"; 
const TABLE_NAME = 'requerimentos';

// --- Componente Modal Genérico ---
const Modal = ({ isOpen, onClose, title, children, widthClass = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={`bg-white p-6 rounded-lg shadow-xl w-full ${widthClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#003c5b]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Componente Principal App ---
function App() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [supabaseClientReady, setSupabaseClientReady] = useState(false);
  
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [mainProvaFilter, setMainProvaFilter] = useState('');
  const [mainTurmaFilter, setMainTurmaFilter] = useState('');
  const [mainStatusFilter, setMainStatusFilter] = useState('');

  const [studentSearchTerm, setStudentSearchTerm] = useState(''); 
  const [suggestedStudents, setSuggestedStudents] = useState([]); 

  const [provas, setProvas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [uniqueStudents, setUniqueStudents] = useState([]);

  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [isRequestFormModalOpen, setIsRequestFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null); 

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  
  const [currentView, setCurrentView] = useState('allRequests'); 
  const [selectedStudentRa, setSelectedStudentRa] = useState('');

  useEffect(() => {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      setSupabaseClient(client);
      setSupabaseClientReady(true);
      return;
    }
    if (document.getElementById(SUPABASE_SCRIPT_ID)) return;
    
    const script = document.createElement('script');
    script.id = SUPABASE_SCRIPT_ID;
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        setSupabaseClient(client);
        setSupabaseClientReady(true);
      } else {
        setError("Supabase SDK carregado, mas window.supabase.createClient não está disponível.");
        setSupabaseClientReady(false);
      }
    };
    script.onerror = () => {
      setError("Falha ao carregar o script do Supabase SDK da CDN.");
      setSupabaseClientReady(false);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  const fetchRequests = useCallback(async (client) => {
    if (!client) return;
    setIsLoading(true); 
    const { data, error: fetchError } = await client.from(TABLE_NAME).select('*').order('CREATEDATE', { ascending: false });
    if (fetchError) {
        setError(`Falha ao carregar dados: ${fetchError.message}`);
        setRequests([]);
    } else if (data) {
        const formattedData = data.map(item => ({
            ...item,
            'AFASTAMENTO (INICIAL)': item['AFASTAMENTO (INICIAL)'] ? new Date(item['AFASTAMENTO (INICIAL)']) : null,
            'AFASTAMENTO (FINAL)': item['AFASTAMENTO (FINAL)'] ? new Date(item['AFASTAMENTO (FINAL)']) : null,
            CREATEDATE: item.CREATEDATE ? new Date(item.CREATEDATE) : null,
            STATUS: item.STATUS || DEFAULT_STATUS, 
        }));
        setRequests(formattedData);
        setError(null); 
    }
    setIsLoading(false); 
  }, []); 

  useEffect(() => {
    if (supabaseClientReady && supabaseClient) {
      fetchRequests(supabaseClient);
      const channel = supabaseClient
        .channel(`public:${TABLE_NAME}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => setTimeout(() => fetchRequests(supabaseClient), 500))
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') console.log('Conectado ao canal de tempo real do Supabase!');
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setError(`Erro na conexão em tempo real: ${status}.`);
        });
      return () => { if (supabaseClient && channel) supabaseClient.removeChannel(channel); };
    }
  }, [supabaseClientReady, supabaseClient, fetchRequests]); 

  useEffect(() => {
    setProvas([...new Set(requests.map(req => req.PROVA).filter(Boolean))].sort());
    setTurmas([...new Set(requests.map(req => req.TURMA).filter(Boolean))].sort());
    setUniqueStudents(requests.reduce((acc, req) => {
      if (req.RA && !acc.find(student => student.RA === req.RA)) acc.push({ NOME: req.NOME, RA: req.RA });
      return acc;
    }, []).sort((a, b) => a.NOME.localeCompare(b.NOME)));
  }, [requests]);

  useEffect(() => {
    if (studentSearchTerm.trim() === '') {
      setSuggestedStudents([]);
      return;
    }
    const searchLower = studentSearchTerm.toLowerCase();
    setSuggestedStudents(
      uniqueStudents.filter(student => 
        (String(student.NOME || '').toLowerCase().includes(searchLower)) || // Correção: Garante que NOME é string
        (String(student.RA || '').toLowerCase().includes(searchLower))    // Correção: Garante que RA é string
      )
    );
  }, [studentSearchTerm, uniqueStudents]);


  const handleStatusChange = async (id_justificativa, newStatus) => { 
    if (!supabaseClientReady || !supabaseClient) { setError("Cliente Supabase não está pronto."); return; }
    const { error: updateError } = await supabaseClient.from(TABLE_NAME).update({ STATUS: newStatus }).eq('id_justificativa', id_justificativa);
    if (updateError) setError(`Falha ao atualizar status: ${updateError.message}`);
  };

  const handleViewDetails = (request) => {
    setSelectedRequestForDetails(request);
    setIsDetailModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingRequest(null);
    setIsRequestFormModalOpen(true);
  };

  const handleOpenEditModal = (request) => {
    setEditingRequest(request);
    setIsRequestFormModalOpen(true);
  };
  
  const handleSaveRequest = async (formData, existingId) => {
    if (!supabaseClientReady || !supabaseClient) { setError("Cliente Supabase não está pronto."); return; }
    
    const dataToSave = {
        NOME: formData.NOME,
        RA: formData.RA,
        TURMA: formData.TURMA,
        PROVA: formData.PROVA,
        STATUS: formData.STATUS,
        CID: formData.CID || null,
        "DIAS DE AFASTAMENTO": formData["DIAS DE AFASTAMENTO"] ? parseInt(formData["DIAS DE AFASTAMENTO"]) : null,
        "AFASTAMENTO (INICIAL)": formData["AFASTAMENTO (INICIAL)"] ? formData["AFASTAMENTO (INICIAL)"].toISOString().split('T')[0] : null,
        "AFASTAMENTO (FINAL)": formData["AFASTAMENTO (FINAL)"] ? formData["AFASTAMENTO (FINAL)"].toISOString().split('T')[0] : null,
        ANEXO: formData.ANEXO || null,
    };

    let responseError;
    if (existingId) { 
        const { error } = await supabaseClient.from(TABLE_NAME).update(dataToSave).eq('id_justificativa', existingId);
        responseError = error;
    } else { 
        const { error } = await supabaseClient.from(TABLE_NAME).insert([dataToSave]);
        responseError = error;
    }

    if (responseError) {
        setError(`Falha ao salvar solicitação: ${responseError.message}`);
    } else {
        setIsRequestFormModalOpen(false);
        setEditingRequest(null); 
    }
  };

  const handleOpenDeleteConfirm = (request) => {
    setRequestToDelete(request);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supabaseClientReady || !supabaseClient || !requestToDelete) { 
        setError("Cliente Supabase não está pronto ou nenhuma solicitação para excluir."); 
        return; 
    }
    const { error: deleteError } = await supabaseClient.from(TABLE_NAME).delete().eq('id_justificativa', requestToDelete.id_justificativa);
    if (deleteError) {
        setError(`Falha ao excluir solicitação: ${deleteError.message}`);
    }
    setIsConfirmDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    let d = date;
    if (!(d instanceof Date)) d = new Date(d);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Aprovado': return 'bg-[#eaf0d0] text-[#506810] border-[#80a51b]';
      case 'Reprovado': return 'bg-red-100 text-red-800 border-red-300';
      case 'Em Análise': return 'bg-[#e6f2f7] text-[#004f72] border-[#00638f]'; 
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };
   const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Aprovado': return 'bg-[#eaf0d0] text-[#506810]';
      case 'Reprovado': return 'bg-red-100 text-red-800';
      case 'Em Análise': return 'bg-[#e6f2f7] text-[#004f72]'; 
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading && !supabaseClientReady) return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">Inicializando e carregando Supabase SDK...</div>;
  if (isLoading && supabaseClientReady && requests.length === 0 && !error) return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">Carregando dados do Supabase...</div>;
  if (error && !supabaseClientReady) return (<div className="flex flex-col justify-center items-center h-screen text-red-600 p-4"><AlertTriangleIcon className="w-16 h-16 mb-4" /><h1 className="text-2xl font-bold mb-2">Erro Crítico de Carregamento</h1><p className="text-center">{error}</p><p className="text-sm mt-4">A aplicação não pode continuar sem a biblioteca Supabase.</p></div>);
  if (error && requests.length === 0 && supabaseClientReady) return (<div className="flex flex-col justify-center items-center h-screen text-red-600 p-4"><AlertTriangleIcon className="w-16 h-16 mb-4" /><h1 className="text-2xl font-bold mb-2">Erro de Conexão com Dados</h1><p className="text-center">{error}</p><p className="text-sm mt-4">Verifique sua conexão e as permissões no Supabase (RLS).</p></div>);
  
  const inputFocusStyle = "focus:ring-[#00638f] focus:border-[#00638f]";

  const renderAllRequestsView = () => {
    let currentFilteredRequests = [...requests]; 
    if (mainSearchTerm) currentFilteredRequests = currentFilteredRequests.filter(req => String(req.NOME || '').toLowerCase().includes(mainSearchTerm.toLowerCase()) || String(req.RA || '').toString().includes(mainSearchTerm));
    if (mainProvaFilter) currentFilteredRequests = currentFilteredRequests.filter(req => req.PROVA === mainProvaFilter);
    if (mainTurmaFilter) currentFilteredRequests = currentFilteredRequests.filter(req => req.TURMA === mainTurmaFilter);
    if (mainStatusFilter) currentFilteredRequests = currentFilteredRequests.filter(req => req.STATUS === mainStatusFilter);

    return (
        <>
        {error && supabaseClientReady && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <input type="text" placeholder="Buscar por Nome ou RA..." className={`p-2 border border-gray-300 rounded-md shadow-sm w-full ${inputFocusStyle}`} value={mainSearchTerm} onChange={(e) => setMainSearchTerm(e.target.value)} />
            <select className={`p-2 border border-gray-300 rounded-md shadow-sm w-full ${inputFocusStyle}`} value={mainProvaFilter} onChange={(e) => setMainProvaFilter(e.target.value)}><option value="">Todas as Provas</option>{provas.map(p => <option key={p} value={p}>{p}</option>)}</select>
            <select className={`p-2 border border-gray-300 rounded-md shadow-sm w-full ${inputFocusStyle}`} value={mainTurmaFilter} onChange={(e) => setMainTurmaFilter(e.target.value)}><option value="">Todas as Turmas</option>{turmas.map(t => <option key={t} value={t}>{t}</option>)}</select>
            <select className={`p-2 border border-gray-300 rounded-md shadow-sm w-full ${inputFocusStyle}`} value={mainStatusFilter} onChange={(e) => setMainStatusFilter(e.target.value)}><option value="">Todos os Status</option>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
        </div>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100"><tr>{['Nome', 'RA', 'Turma', 'Prova', 'Status', 'Criação', 'Ações'].map(header => (<th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{header}</th>))}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {currentFilteredRequests.length > 0 ? currentFilteredRequests.map(req => (
                <tr key={req.id_justificativa} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{req.NOME}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{req.RA}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{req.TURMA}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{req.PROVA}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><select value={req.STATUS || ''} onChange={(e) => handleStatusChange(req.id_justificativa, e.target.value)} className={`p-1.5 text-xs rounded-md border ${getStatusStyles(req.STATUS)} focus:outline-none focus:ring-2 ${inputFocusStyle}`}>{STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}</select></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(req.CREATEDATE)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                        <button onClick={() => handleViewDetails(req)} className="text-[#00638f] hover:text-[#003c5b] p-1 rounded hover:bg-[#e6f2f7] transition-colors" title="Ver Detalhes"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleOpenEditModal(req)} className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 transition-colors" title="Editar"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleOpenDeleteConfirm(req)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
                        {req.ANEXO && (<a href={req.ANEXO} target="_blank" rel="noopener noreferrer" className="text-[#00638f] hover:text-[#003c5b] p-1 rounded hover:bg-[#e6f2f7] transition-colors" title="Ver Anexo">🔗</a>)}
                    </td>
                </tr>
                )) : (<tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">Nenhuma solicitação encontrada.</td></tr>)}
            </tbody>
            </table>
        </div>
        </>
    );
  }

  const renderApprovedByExamView = () => {
    const approvedByExam = provas.map(prova => {
        const studentsForThisExam = requests.filter(req => req.PROVA === prova && req.STATUS === 'Aprovado');
        studentsForThisExam.sort((a,b) => a.NOME.localeCompare(b.NOME));
        return { prova, students: studentsForThisExam };
    }).filter(group => group.students.length > 0); 

    if (requests.length === 0 && !isLoading && supabaseClientReady) return <p className="text-gray-600 p-4 text-center">Nenhuma solicitação encontrada no banco de dados.</p>;
    if (approvedByExam.length === 0 && !isLoading && supabaseClientReady) return <p className="text-gray-600 p-4 text-center">Nenhum aluno aprovado para segunda chamada em nenhuma prova ainda.</p>;
    
    return (<div className="space-y-8">{error && supabaseClientReady && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}{approvedByExam.map(({ prova, students }) => (<div key={prova} className="bg-white shadow-md rounded-lg p-6"><h3 className="text-xl font-semibold text-[#80a51b] mb-4">Prova: {prova}</h3><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Nome', 'RA', 'Turma', 'Data Solicitação'].map(header => (<th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>))}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{students.map(req => (<tr key={req.id_justificativa} className="hover:bg-[#f2f5e8]"><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{req.NOME}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{req.RA}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{req.TURMA}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(req.CREATEDATE)}</td></tr>))}</tbody></table></div></div>))}</div>);
  };

  const renderRequestsByStudentView = () => {
    const studentSpecificRequests = selectedStudentRa 
        ? requests.filter(req => req.RA === selectedStudentRa)
        : [];
    
    const selectedStudentObject = uniqueStudents.find(s => s.RA === selectedStudentRa);

    if (requests.length === 0 && !isLoading && supabaseClientReady && !selectedStudentRa) return <p className="text-gray-600 p-4 text-center">Nenhuma solicitação encontrada no banco de dados.</p>;

    return (
      <>
        {error && supabaseClientReady && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
            <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Aluno (Nome ou RA):
            </label>
            <input
                type="text"
                id="studentSearch"
                placeholder="Digite para buscar..."
                className={`p-2 border border-gray-300 rounded-md shadow-sm w-full mb-2 ${inputFocusStyle}`}
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
            />
            {studentSearchTerm && suggestedStudents.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                    {suggestedStudents.map(student => (
                        <div 
                            key={student.RA}
                            onClick={() => {
                                setSelectedStudentRa(student.RA);
                                setStudentSearchTerm(''); 
                                setSuggestedStudents([]); 
                            }}
                            className="p-3 cursor-pointer hover:bg-[#e6f2f7] transition-colors border-b border-gray-200 last:border-b-0"
                        >
                            {student.NOME} (RA: {student.RA})
                        </div>
                    ))}
                </div>
            )}
            {studentSearchTerm && suggestedStudents.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Nenhum aluno encontrado com "{studentSearchTerm}".</p>
            )}
        </div>

        {selectedStudentRa && selectedStudentObject && (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-[#00638f] mb-4">
              Solicitações de: {selectedStudentObject.NOME} (RA: {selectedStudentObject.RA})
            </h3>
            {studentSpecificRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>{['Prova', 'Turma', 'Status', 'Criação', 'Ações'].map(header => (<th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>))}</tr></thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentSpecificRequests.map(req => (
                      <tr key={req.id_justificativa} className="hover:bg-[#e6f2f7] transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{req.PROVA}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{req.TURMA}</td>
                        <td className="px-4 py-2 whitespace-nowrap"><select value={req.STATUS || ''} onChange={(e) => handleStatusChange(req.id_justificativa, e.target.value)} className={`p-1.5 text-xs rounded-md border ${getStatusStyles(req.STATUS)} focus:outline-none focus:ring-2 ${inputFocusStyle}`}>{STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}</select></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(req.CREATEDATE)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                            <button onClick={() => handleViewDetails(req)} className="text-[#00638f] hover:text-[#003c5b] p-1 rounded hover:bg-[#e6f2f7] transition-colors" title="Ver Detalhes"><EyeIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleOpenEditModal(req)} className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 transition-colors" title="Editar"><EditIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleOpenDeleteConfirm(req)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
                            {req.ANEXO && (<a href={req.ANEXO} target="_blank" rel="noopener noreferrer" className="text-[#00638f] hover:text-[#003c5b] p-1 rounded hover:bg-[#e6f2f7] transition-colors" title="Ver Anexo">🔗</a>)}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            ) : (<p className="text-sm text-gray-500">Nenhuma solicitação encontrada para este aluno.</p>)}
          </div>
        )}
        {!selectedStudentRa && requests.length > 0 && !isLoading && supabaseClientReady && !studentSearchTerm && (<p className="text-gray-600 p-4 text-center">Digite o nome ou RA de um aluno para ver suas solicitações.</p>)}
      </>
    );
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-100 min-h-screen font-sans">
      <header className="mb-8 text-center"><h1 className="text-3xl md:text-4xl font-bold text-[#003c5b]">Sistema de Gerenciamento de Segunda Chamada</h1></header>
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <button onClick={() => setCurrentView('allRequests')} className={`px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-sm ${currentView === 'allRequests' ? 'bg-[#003c5b] text-white hover:bg-[#002c44]' : 'bg-white text-[#003c5b] border border-[#003c5b] hover:bg-[#e6f0f3]'}`}>Todas as Solicitações</button>
        <button onClick={() => setCurrentView('approvedByExam')} className={`px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-sm ${currentView === 'approvedByExam' ? 'bg-[#80a51b] text-white hover:bg-[#6a8a15]' : 'bg-white text-[#80a51b] border border-[#80a51b] hover:bg-[#f2f5e8]'}`}>Aprovados por Prova</button>
        <button onClick={() => setCurrentView('requestsByStudent')} className={`px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-sm ${currentView === 'requestsByStudent' ? 'bg-[#00638f] text-white hover:bg-[#004f72]' : 'bg-white text-[#00638f] border border-[#00638f] hover:bg-[#e6f2f7]'}`}>Solicitações por Aluno</button>
        <button onClick={handleOpenAddModal} className="ml-auto flex items-center px-4 py-2 bg-[#003c5b] text-white rounded-md hover:bg-[#002c44] transition-colors shadow-sm text-sm" disabled={!supabaseClientReady}><PlusCircleIcon className="w-4 h-4 mr-1.5" />Adicionar Solicitação</button>
      </div>
      {currentView === 'allRequests' && renderAllRequestsView()}
      {currentView === 'approvedByExam' && renderApprovedByExamView()}
      {currentView === 'requestsByStudent' && renderRequestsByStudentView()}
      
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detalhes da Solicitação">
        {selectedRequestForDetails && ( <div className="space-y-3 text-sm"> <p><strong>ID da Justificativa:</strong> {selectedRequestForDetails.id_justificativa}</p> <p><strong>Nome:</strong> {selectedRequestForDetails.NOME}</p> <p><strong>RA:</strong> {selectedRequestForDetails.RA}</p> <p><strong>Turma:</strong> {selectedRequestForDetails.TURMA}</p> <p><strong>Prova:</strong> {selectedRequestForDetails.PROVA}</p> <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeStyles(selectedRequestForDetails.STATUS)}`}>{selectedRequestForDetails.STATUS}</span></p> <p><strong>CID:</strong> {selectedRequestForDetails.CID || 'N/A'}</p> <p><strong>Dias de Afastamento:</strong> {selectedRequestForDetails['DIAS DE AFASTAMENTO'] || 'N/A'}</p> <p><strong>Início do Afastamento:</strong> {formatDate(selectedRequestForDetails['AFASTAMENTO (INICIAL)'])}</p> <p><strong>Fim do Afastamento:</strong> {formatDate(selectedRequestForDetails['AFASTAMENTO (FINAL)'])}</p> <p><strong>Data da Solicitação:</strong> {formatDate(selectedRequestForDetails.CREATEDATE)}</p> {selectedRequestForDetails.ANEXO && (<p><strong>Anexo:</strong> <a href={selectedRequestForDetails.ANEXO} target="_blank" rel="noopener noreferrer" className="text-[#00638f] hover:underline">Visualizar Anexo</a></p>)} <div className="mt-6 flex justify-end space-x-3"> <button onClick={() => { handleStatusChange(selectedRequestForDetails.id_justificativa, 'Aprovado'); setIsDetailModalOpen(false); }} className="px-4 py-2 bg-[#80a51b] text-white rounded-md hover:bg-[#6a8a15] transition-colors flex items-center text-sm" disabled={!supabaseClientReady}><CheckCircleIcon className="w-4 h-4 mr-2" /> Aprovar</button> <button onClick={() => { handleStatusChange(selectedRequestForDetails.id_justificativa, 'Reprovado'); setIsDetailModalOpen(false); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm" disabled={!supabaseClientReady}><XCircleIcon className="w-4 h-4 mr-2" /> Reprovar</button> <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 bg-gray-400 text-gray-800 rounded-md hover:bg-gray-500 transition-colors text-sm">Fechar</button> </div> </div>)}
      </Modal>

      <RequestFormModal 
        isOpen={isRequestFormModalOpen} 
        onClose={() => { setIsRequestFormModalOpen(false); setEditingRequest(null); }} 
        onSave={handleSaveRequest} 
        initialData={editingRequest}
        inputFocusStyle={inputFocusStyle} 
        supabaseClientReady={supabaseClientReady} 
      />

      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        requestInfo={requestToDelete ? `a solicitação de ${requestToDelete.NOME} (Prova: ${requestToDelete.PROVA})` : "esta solicitação"}
        supabaseClientReady={supabaseClientReady}
      />
    </div>
  );
}

const RequestFormModal = ({ isOpen, onClose, onSave, initialData, inputFocusStyle, supabaseClientReady }) => {
    const isEditMode = Boolean(initialData);
    const [formData, setFormData] = useState({
        NOME: '', RA: '', TURMA: '', CID: '', 'DIAS DE AFASTAMENTO': '', 
        'AFASTAMENTO (INICIAL)': '', 'AFASTAMENTO (FINAL)': '', ANEXO: '', 
        PROVA: '', STATUS: DEFAULT_STATUS 
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    NOME: initialData.NOME || '',
                    RA: initialData.RA || '',
                    TURMA: initialData.TURMA || '',
                    CID: initialData.CID || '',
                    'DIAS DE AFASTAMENTO': initialData['DIAS DE AFASTAMENTO'] || '',
                    'AFASTAMENTO (INICIAL)': initialData['AFASTAMENTO (INICIAL)'] instanceof Date ? initialData['AFASTAMENTO (INICIAL)'] : '',
                    'AFASTAMENTO (FINAL)': initialData['AFASTAMENTO (FINAL)'] instanceof Date ? initialData['AFASTAMENTO (FINAL)'] : '',
                    ANEXO: initialData.ANEXO || '',
                    PROVA: initialData.PROVA || '',
                    STATUS: initialData.STATUS || DEFAULT_STATUS, 
                });
            } else {
                setFormData({ 
                    NOME: '', RA: '', TURMA: '', CID: '', 'DIAS DE AFASTAMENTO': '', 
                    'AFASTAMENTO (INICIAL)': '', 'AFASTAMENTO (FINAL)': '', ANEXO: '', 
                    PROVA: '', STATUS: DEFAULT_STATUS 
                });
            }
        }
    }, [isOpen, isEditMode, initialData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'date') {
            setFormData(prev => ({ ...prev, [name]: value ? new Date(value + "T00:00:00Z") : '' })); 
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supabaseClientReady) {
            alert("Erro: Cliente Supabase não está pronto. Tente novamente.");
            return;
        }
        onSave(formData, initialData?.id_justificativa);
    };
    
    if (!isOpen) return null;
    const baseInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm";
    const formatDateForInput = (date) => date instanceof Date && !isNaN(date) ? date.toISOString().split('T')[0] : '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Solicitação" : "Adicionar Nova Solicitação"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {isEditMode && initialData && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">ID da Justificativa</label>
                        <input type="text" value={initialData.id_justificativa} className={`${baseInputClass} bg-gray-100 ${inputFocusStyle}`} readOnly />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="NOME" className="block text-sm font-medium text-gray-700">Nome do Aluno</label><input type="text" name="NOME" id="NOME" value={formData.NOME} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} required /></div>
                    <div><label htmlFor="RA" className="block text-sm font-medium text-gray-700">RA</label><input type="text" name="RA" id="RA" value={formData.RA} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} required /></div>
                    <div><label htmlFor="TURMA" className="block text-sm font-medium text-gray-700">Turma</label><input type="text" name="TURMA" id="TURMA" value={formData.TURMA} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} required /></div>
                    <div><label htmlFor="PROVA" className="block text-sm font-medium text-gray-700">Prova</label><input type="text" name="PROVA" id="PROVA" value={formData.PROVA} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} required /></div>
                    <div><label htmlFor="AFASTAMENTO (INICIAL)" className="block text-sm font-medium text-gray-700">Início do Afastamento</label><input type="date" name="AFASTAMENTO (INICIAL)" id="AFASTAMENTO (INICIAL)" value={formatDateForInput(formData['AFASTAMENTO (INICIAL)'])} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} /></div>
                    <div><label htmlFor="AFASTAMENTO (FINAL)" className="block text-sm font-medium text-gray-700">Fim do Afastamento</label><input type="date" name="AFASTAMENTO (FINAL)" id="AFASTAMENTO (FINAL)" value={formatDateForInput(formData['AFASTAMENTO (FINAL)'])} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} /></div>
                    <div><label htmlFor="DIAS DE AFASTAMENTO" className="block text-sm font-medium text-gray-700">Dias de Afastamento</label><input type="number" name="DIAS DE AFASTAMENTO" id="DIAS DE AFASTAMENTO" value={formData['DIAS DE AFASTAMENTO']} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} min="0" /></div>
                    <div><label htmlFor="CID" className="block text-sm font-medium text-gray-700">CID (Opcional)</label><input type="text" name="CID" id="CID" value={formData.CID} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} /></div>
                    <div className="md:col-span-2"><label htmlFor="ANEXO" className="block text-sm font-medium text-gray-700">Link do Anexo (URL)</label><input type="url" name="ANEXO" id="ANEXO" value={formData.ANEXO} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`} placeholder="https://exemplo.com/anexo.pdf"/></div>
                    <div><label htmlFor="STATUS" className="block text-sm font-medium text-gray-700">Status</label><select name="STATUS" id="STATUS" value={formData.STATUS} onChange={handleChange} className={`${baseInputClass} ${inputFocusStyle}`}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-sm">Cancelar</button><button type="submit" className="px-4 py-2 bg-[#003c5b] text-white rounded-md hover:bg-[#002c44] transition-colors text-sm" disabled={!supabaseClientReady}>{isEditMode ? "Salvar Alterações" : "Adicionar Solicitação"}</button></div>
            </form>
        </Modal>
    );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, requestInfo, supabaseClientReady }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão" widthClass="max-w-md">
      <div className="text-sm text-gray-700">
        <p>Tem certeza que deseja excluir {requestInfo}?</p>
        <p className="mt-1 font-semibold">Esta ação não poderá ser desfeita.</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={onClose} 
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-sm"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm} 
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
          disabled={!supabaseClientReady}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Confirmar Exclusão
        </button>
      </div>
    </Modal>
  );
};

export default App;
