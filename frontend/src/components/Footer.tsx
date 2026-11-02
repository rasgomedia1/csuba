import React from 'react';
import content from '../content.json';

export const Footer: React.FC = () => (
  <footer className="border-t bg-white text-xs text-gray-500">
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between gap-2">
      <span>
        © {new Date().getFullYear()} {content.footer.firma}{' '}
        <a href={content.footer.firmaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
          {content.footer.firmaDominio}
        </a>
      </span>
      <span>
        {content.footer.version.replace('{version}', __APP_VERSION__).replace('{build}', __APP_BUILD__)}
      </span>
    </div>
  </footer>
);
