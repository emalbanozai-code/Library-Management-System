import { useTranslation } from "react-i18next"

function Dashboard() {
  const {t} = useTranslation()

  
  return (
    <div className='text-4xl'>{t('Dashboard.welcome')}
    <div>{t('Dashboard.text')}</div>
    </div>
    
  )
}

export default Dashboard