type Translations = {
  [key: string]: {
    en: string
    'pt-br': string
  }
}

export const translations: Translations = {
  'Tasks': { en: 'Tasks', 'pt-br': 'Tarefas' },
  'To do': { en: 'To do', 'pt-br': 'Tarefas' },
  'Unscheduled': { en: 'Unscheduled', 'pt-br': 'Sem data' },
  'Today': { en: 'Today', 'pt-br': 'Hoje' },
  'Day': { en: 'Day', 'pt-br': 'Dia' },
  'Add a task': { en: 'Add a task', 'pt-br': 'Adicionar tarefa' },
  'Ready to Focus': { en: 'Ready to Focus', 'pt-br': 'Pronto para focar' },
  'open': { en: 'open', 'pt-br': 'abertas' },
  'Journey Streak': { en: 'Journey Streak', 'pt-br': 'Dias Seguidos' },
  'Capture ideas and tasks without a specific date here.': {
    en: 'Capture ideas and tasks without a specific date here.',
    'pt-br': 'Capture ideias e tarefas sem data específica aqui.'
  },
  'Focus Session Complete!': {
    en: 'Focus Session Complete!',
    'pt-br': 'Sessão de Foco Concluída!'
  },
  'Great job staying focused.': {
    en: 'Great job staying focused.',
    'pt-br': 'Bom trabalho mantendo o foco.'
  },
  'Settings': { en: 'Settings', 'pt-br': 'Configurações' },
  'Language': { en: 'Language', 'pt-br': 'Idioma' },
  'Task': { en: 'Task', 'pt-br': 'Tarefa' },
  'Add task': { en: 'Add task', 'pt-br': 'Adicionar tarefa' },
  'Categories': { en: 'Categories', 'pt-br': 'Categorias' },
  'Category': { en: 'Category', 'pt-br': 'Categoria' },
  'Add category': { en: 'Add category', 'pt-br': 'Adicionar categoria' },
  'No category': { en: 'No category', 'pt-br': 'Sem categoria' },
  'New category': { en: 'New category', 'pt-br': 'Nova categoria' },
  'Category name': { en: 'Category name', 'pt-br': 'Nome da categoria' },
  'Add Category': { en: 'Add Category', 'pt-br': 'Adicionar Categoria' },
  'Completed by Category': { en: 'Completed by Category', 'pt-br': 'Concluídas por Categoria' },
  'No completed tasks yet': { en: 'No completed tasks yet', 'pt-br': 'Nenhuma tarefa concluída' },
  'completed': { en: 'completed', 'pt-br': 'concluídas' },
  'Work': { en: 'Work', 'pt-br': 'Trabalho' },
  'Study': { en: 'Study', 'pt-br': 'Estudos' },
  'Health': { en: 'Health', 'pt-br': 'Saúde' },
  'Personal': { en: 'Personal', 'pt-br': 'Pessoal' },
  'Sun': { en: 'Sun', 'pt-br': 'Dom' },
  'Mon': { en: 'Mon', 'pt-br': 'Seg' },
  'Tue': { en: 'Tue', 'pt-br': 'Ter' },
  'Wed': { en: 'Wed', 'pt-br': 'Qua' },
  'Thu': { en: 'Thu', 'pt-br': 'Qui' },
  'Fri': { en: 'Fri', 'pt-br': 'Sex' },
  'Sat': { en: 'Sat', 'pt-br': 'Sáb' }
}

export function useTranslation(language: string) {
  const lang = language.toLowerCase() === 'pt-br' ? 'pt-br' : 'en'
  
  const t = (key: string): string => {
    return translations[key]?.[lang] || key
  }
  
  return { t }
}
