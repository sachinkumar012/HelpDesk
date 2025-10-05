import React, { createContext, useContext, useReducer } from 'react';
import { ticketAPI } from '../api';
import toast from 'react-hot-toast';

const TicketContext = createContext();

const initialState = {
  tickets: [],
  currentTicket: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    next_offset: null
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    breached: false
  }
};

const ticketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload.items,
        pagination: {
          total: action.payload.total,
          next_offset: action.payload.next_offset
        },
        loading: false,
        error: null
      };
    case 'ADD_TICKETS':
      return {
        ...state,
        tickets: [...state.tickets, ...action.payload.items],
        pagination: {
          total: action.payload.total,
          next_offset: action.payload.next_offset
        },
        loading: false
      };
    case 'SET_CURRENT_TICKET':
      return {
        ...state,
        currentTicket: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket._id === action.payload._id ? action.payload : ticket
        ),
        currentTicket: state.currentTicket?._id === action.payload._id 
          ? action.payload 
          : state.currentTicket,
        loading: false
      };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
        loading: false
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        loading: false
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'CLEAR_CURRENT_TICKET':
      return {
        ...state,
        currentTicket: null
      };
    default:
      return state;
  }
};

export const TicketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const getTickets = async (params = {}, append = false) => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTickets(params);
      
      if (append) {
        dispatch({ type: 'ADD_TICKETS', payload: response });
      } else {
        dispatch({ type: 'SET_TICKETS', payload: response });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const getTicket = async (id) => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTicket(id);
      dispatch({ type: 'SET_CURRENT_TICKET', payload: response });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const createTicket = async (ticketData) => {
    try {
      setLoading(true);
      const response = await ticketAPI.createTicket(ticketData);
      dispatch({ type: 'ADD_TICKET', payload: response.ticket });
      toast.success('Ticket created successfully!');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateTicket = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await ticketAPI.updateTicket(id, updateData);
      dispatch({ type: 'UPDATE_TICKET', payload: response.ticket });
      toast.success('Ticket updated successfully!');
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getStats = async () => {
    try {
      const response = await ticketAPI.getStats();
      dispatch({ type: 'SET_STATS', payload: response.stats });
      return response;
    } catch (error) {
      setError(error.message);
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearCurrentTicket = () => {
    dispatch({ type: 'CLEAR_CURRENT_TICKET' });
  };

  const value = {
    ...state,
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    getStats,
    setFilters,
    clearCurrentTicket,
    setLoading,
    setError
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export default TicketContext;