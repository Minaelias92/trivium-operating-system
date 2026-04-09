import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  getScanHistory,
  getFavorites,
  isOnboardingComplete,
} from '../services/storage';

const AppContext = createContext(null);

const initialState = {
  user: null,
  scanHistory: [],
  favorites: [],
  onboardingComplete: false,
  isLoading: true,
  currentScan: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: true };
    case 'ADD_SCAN':
      return {
        ...state,
        scanHistory: [action.payload, ...state.scanHistory].slice(0, 500),
      };
    case 'SET_CURRENT_SCAN':
      return { ...state, currentScan: action.payload };
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [action.payload, ...state.favorites],
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(f => f.barcode !== action.payload),
      };
    case 'CLEAR_HISTORY':
      return { ...state, scanHistory: [] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function init() {
      try {
        const [user, scanHistory, favorites, onboarding] = await Promise.all([
          getUserProfile(),
          getScanHistory(),
          getFavorites(),
          isOnboardingComplete(),
        ]);

        dispatch({
          type: 'INIT',
          payload: {
            user,
            scanHistory,
            favorites,
            onboardingComplete: onboarding,
          },
        });
      } catch (error) {
        console.error('Failed to initialize app state:', error);
        dispatch({ type: 'INIT', payload: {} });
      }
    }
    init();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
