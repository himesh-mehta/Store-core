import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "StoreCore Docs",
  description: "Documentation for the StoreCore platform",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Web App', link: '/WEB_APP_ARCHITECTURE' },
      { text: 'Database & Auth', link: '/DATABASE_AND_AUTH' },
    ],
    sidebar: [
      {
        text: 'Project Info',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Project Plan', link: '/PROJECT_PLAN' },
          { text: 'Roadmap', link: '/ROADMAP' },
        ]
      },
      {
        text: 'Technical Details',
        items: [
          { text: 'Tools & Technology', link: '/TOOLS_AND_TECH' },
          { text: 'Web App Architecture', link: '/WEB_APP_ARCHITECTURE' },
          { text: 'Database & Auth', link: '/DATABASE_AND_AUTH' },
          { text: 'Database Migrations', link: '/DATABASE_MIGRATIONS' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/himesh-mehta/Store-core' }
    ]
  }
})
