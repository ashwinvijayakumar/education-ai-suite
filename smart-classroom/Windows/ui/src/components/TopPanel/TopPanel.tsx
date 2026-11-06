import React, { useRef, useState, useEffect } from 'react';
import '../../assets/css/TopPanel.css';
import BrandSlot from '../../assets/images/BrandSlot.svg';
import LanguageSwitcher from '../LanguageSwitcher';
import Icon from '../common/Icon';
import { useTranslation } from 'react-i18next';
import { isServiceManagerAvailable } from '../../services/serviceManager';
import type { FeatureGuard } from '../../utils/featureGuards';

// Desk for the teacher's laptop; Board scales the UI for a classroom panel.
const DISPLAY_MODES = ['desk', 'board'] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];
const DISPLAY_KEY = 'smart-classroom.display';

const initialDisplay = (): DisplayMode => {
  const requested = new URLSearchParams(window.location.search).get('display') ?? localStorage.getItem(DISPLAY_KEY);
  return DISPLAY_MODES.find((mode) => mode === requested) ?? 'desk';
};

interface TopPanelProps {
  activeScreen: 'main' | 'content-search' | 'grading' | 'services' | 'config' | 'setup' | 'ready';
  setActiveScreen: (screen: 'main' | 'content-search' | 'grading' | 'services' | 'config' | 'setup' | 'ready') => void;
  featureGuard: FeatureGuard;
  hasMainFeatures: boolean;
}

const TopPanel: React.FC<TopPanelProps> = ({
  activeScreen,
  setActiveScreen,
  featureGuard,
  hasMainFeatures
}) => {
  const navMenuRef = useRef<HTMLDivElement>(null);
  const navToggleRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [display, setDisplay] = useState<DisplayMode>(initialDisplay);

  useEffect(() => {
    document.documentElement.dataset.display = display;
    localStorage.setItem(DISPLAY_KEY, display);
  }, [display]);

  const isElectron = !!window.electronAPI?.isElectron;
  const hasServiceManager = isServiceManagerAvailable();
  // Show Content Search UI if either content_search OR qa feature is enabled
  const hasContentSearchFeatures = featureGuard.hasFeature('content_search') || featureGuard.hasFeature('qa');
  const hasGradingFeature = featureGuard.hasFeature('grading');

  // Close nav menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavMenuOpen(false);
      }
    };

    if (isNavMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavMenuOpen]);

  const toggleNavMenu = () => {
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const handleNavItemClick = (action: () => void) => {
    action();
    setIsNavMenuOpen(false);
  };

  // Electron only: open the native application menu (File/Edit/View/Window).
  // Anchored under the hamburger toggle. Using the still-visible toggle 
  // makes the native menu appear where the dropdown was.
  const openAppMenu = () => {
    const rect = navToggleRef.current?.getBoundingClientRect();
    window.electronAPI?.popupMenu(
      rect ? { x: rect.left, y: rect.bottom + 8 } : undefined
    );
  };

  // Reusable navigation menu component
  const renderNavMenu = () => (
    <div className="nav-menu-container" ref={navMenuRef}>
      <button
        ref={navToggleRef}
        className="nav-menu-toggle"
        onClick={toggleNavMenu}
        aria-label={t('menu.toggle', 'Toggle menu')}
        aria-expanded={isNavMenuOpen}
        title={t('menu.toggle', 'Toggle menu')}
      >
        <Icon name="menu" />
      </button>
      {isNavMenuOpen && (
        <div className="nav-menu-dropdown">
          <div className="nav-menu-header">
            <span>{t('menu.navigation', 'Navigation')}</span>
          </div>
          <ul className="nav-menu-list">
            <li className={activeScreen === 'main' ? 'active' : ''}>
              <button
                type="button"
                disabled={!hasMainFeatures}
                aria-current={activeScreen === 'main' ? 'page' : undefined}
                onClick={() => handleNavItemClick(() => setActiveScreen('main'))}
              >
                <Icon name="home" className="menu-icon" />
                <span>{t('menu.home', 'Home')}</span>
              </button>
            </li>
            <li className={activeScreen === 'content-search' ? 'active' : ''}>
              <button
                type="button"
                disabled={!hasContentSearchFeatures}
                aria-current={activeScreen === 'content-search' ? 'page' : undefined}
                onClick={() => handleNavItemClick(() => setActiveScreen('content-search'))}
              >
                <Icon name="search" className="menu-icon" />
                <span>{t('contentSearch.title', 'Content Search')}</span>
              </button>
            </li>
            <li className={activeScreen === 'grading' ? 'active' : ''}>
              <button
                type="button"
                disabled={!hasGradingFeature}
                aria-current={activeScreen === 'grading' ? 'page' : undefined}
                onClick={() => handleNavItemClick(() => setActiveScreen('grading'))}
              >
                <Icon name="grading" className="menu-icon" />
                <span>{t('grading.title', 'Grading')}</span>
              </button>
            </li>
            {/* Report and Session history are not here: they open slide-over
                panels rather than navigating, so they are buttons on the header
                bar, next to the audio/video status they belong with. */}
            {/* Electron only: supervision of the Python backend processes */}
            {hasServiceManager && (
              <li className={`nav-menu-tools${activeScreen === 'ready' ? ' active' : ''}`}>
                <button type="button" onClick={() => handleNavItemClick(() => setActiveScreen('ready'))}>
                  <Icon name="compass" className="menu-icon" />
                  <span>{t('getStarted.title', 'Get started')}</span>
                </button>
              </li>
            )}
            {/* Electron only: prerequisite checks and environment preparation */}
            {hasServiceManager && (
              <li className={activeScreen === 'setup' ? 'active' : ''}>
                <button type="button" onClick={() => handleNavItemClick(() => setActiveScreen('setup'))}>
                  <Icon name="wrench" className="menu-icon" />
                  <span>{t('setup.title', 'Setup')}</span>
                </button>
              </li>
            )}
            {/* Electron only: schema-guarded editor for config.yaml and friends */}
            {hasServiceManager && (
              <li className={activeScreen === 'config' ? 'active' : ''}>
                <button type="button" onClick={() => handleNavItemClick(() => setActiveScreen('config'))}>
                  <Icon name="sliders" className="menu-icon" />
                  <span>{t('config.title', 'Configuration')}</span>
                </button>
              </li>
            )}
            {hasServiceManager && (
              <li className={activeScreen === 'services' ? 'active' : ''}>
                <button type="button" onClick={() => handleNavItemClick(() => setActiveScreen('services'))}>
                  <Icon name="server" className="menu-icon" />
                  <span>{t('services.title', 'Services')}</span>
                </button>
              </li>
            )}
            {/* Electron only: the native application menu (File/Edit/View/Window) */}
            {isElectron && (
              <li className="nav-menu-app-menu">
                <button
                  type="button"
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    openAppMenu();
                  }}
                >
                  <Icon name="more" className="menu-icon" />
                  <span>{t('menu.appMenu', 'Application menu')}</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const title =
    activeScreen === 'grading' ? t('grading.title', 'Grading') :
    activeScreen === 'content-search' ? t('contentSearch.title', 'Content Search') :
    t('header.title');

  return (
    <header className="top-panel">
      <div className="brand-slot">
        {renderNavMenu()}
        <img src={BrandSlot} alt="Intel Logo" className="logo" />
        <span className="app-title">{title}</span>
      </div>
      <div className="action-slot">
        <div className="segmented display-toggle" role="group" aria-label={t('menu.display', 'Display')}>
          {DISPLAY_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={display === mode}
              onClick={() => setDisplay(mode)}
            >
              {t(`menu.${mode}`, mode === 'desk' ? 'Desk' : 'Board')}
            </button>
          ))}
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default TopPanel;
