'use client';

import { useEffect, useState } from 'react';
import {
  Activity, AudioLines, CalendarDays, ChevronRight, CircleAlert,
  Droplets, Globe2, Leaf, Scale, Thermometer, Volume2, Waves,
} from 'lucide-react';
import { mockHiveInsights, mockHives, mockIoTReadings } from '@/lib/mock-data';
import type { Hive } from '@/lib/types';
import type { Language } from '@/lib/translations';

const FLORAL_TRANSLATIONS: Record<string, string> = {
  Mustard: 'सरसों (Mustard)',
  Acacia: 'बबूल (Acacia)',
  Multifloral: 'बहुपुष्पीय (Multifloral)',
  Sidr: 'सिद्र / बेरी (Sidr)',
  Eucalyptus: 'सफेदा (Eucalyptus)',
  'Kashmir White': 'कश्मीरी सफेद (Kashmir White)',
  'Wild Forest': 'जंगली वन (Wild Forest)',
};

function getFloralLabel(floral: string, isHindi: boolean): string {
  if (!isHindi) return floral;
  return FLORAL_TRANSLATIONS[floral] || floral;
}

function stateLabel(hive: Hive, isHindi: boolean) {
  if (hive.status === 'alert') return isHindi ? 'निरीक्षण आवश्यक' : 'needs field check';
  if (hive.status === 'maintenance') return isHindi ? 'रखरखाव नियोजित' : 'maintenance planned';
  return isHindi ? 'सामान्य अवलोकन' : 'routine observation';
}

function translateAlert(alert: string, isHindi: boolean): string {
  if (!isHindi) return alert;
  if (alert.includes('Temperature fluctuations')) return 'पिछले 72 घंटों में बक्से के तापमान में असामान्य उतार-चढ़ाव दर्ज हुआ।';
  if (alert.includes('Weight gain below')) return 'वजन में वृद्धि अनुमानित दर से धीमी है; छत्ते की जांच करें।';
  if (alert.includes('Significant drop in colony sound')) return 'कॉलोनी की ध्वनि आवृत्ति में तेज गिरावट; रानी मक्खी की स्थिति जांचें।';
  if (alert.includes('Weight has decreased')) return 'पिछले 5 दिनों में बक्से के वजन में 8% की कमी दर्ज हुई है।';
  if (alert.includes('Temperature regulation appears')) return 'तापमान नियंत्रण कमजोर लग रहा है; इन्सुलेशन व वेंटिलेशन जांचें।';
  return alert;
}

function translateRecommendation(rec: string, isHindi: boolean): string {
  if (!isHindi) return rec;
  if (rec.includes('H-018 shows signs of early-stage stress')) {
    return 'बक्सा H-018 तनाव के शुरुआती संकेत दे रहा है। गतिविधि बेसलाइन से 23% कम है। 48 घंटों में वरोआ माइट या रानी मक्खी की स्थिति की भौतिक जांच करें।';
  }
  if (rec.includes('H-019 is performing excellently')) {
    return 'बक्सा H-019 बेहतरीन स्थिति में है। वजन वृद्धि के अनुसार 7-10 दिनों में शहद निकालने के लिए तैयार होगा। गतिविधि औसत से 15% अधिक है।';
  }
  if (rec.includes('URGENT: Hive H-021')) {
    return 'अति आवश्यक: बक्सा H-021 संकट के संकेत दे रहा है। ध्वनि विश्लेषण रानी मक्खी की अनुपस्थिति दर्शाता है। तत्काल भौतिक निरीक्षण करें।';
  }
  return rec;
}

export default function HivesPage() {
  const [lang, setLang] = useState<Language>('en');
  const [selectedId, setSelectedId] = useState(mockHives[0]?.id ?? '');
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('farmer_lang') as Language | null;
      if (savedLang === 'hi' || savedLang === 'en') {
        setLang(savedLang);
      }
    } catch { }
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    try {
      localStorage.setItem('farmer_lang', next);
    } catch { }
  };

  const isHindi = lang === 'hi';
  const selected = mockHives.find((hive) => hive.id === selectedId) ?? mockHives[0];
  const insight = mockHiveInsights.find((item) => item.hiveId === selected?.id);
  const readings = selected?.id === 'HIVE-019' ? mockIoTReadings : [];
  const latest = readings.at(-1);

  const playHiveAudio = () => {
    setAudioPlaying(true);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => setAudioPlaying(false), 1200);
      return;
    }
    window.speechSynthesis.cancel();
    const alertCount = insight?.alerts.length ?? 0;
    const textToSpeak = isHindi
      ? `बक्सा ${selected.name} का स्वास्थ्य स्कोर ${selected.currentHealth} प्रतिशत है। अनुमानित उपज ${selected.predictedYield} किलोग्राम है। ${
          alertCount > 0
            ? 'सावधानी: इस बक्से में निरीक्षण की आवश्यकता है।'
            : 'सभी स्थितियां सामान्य और सुरक्षित हैं।'
        }`
      : `Colony ${selected.name} has a field health score of ${selected.currentHealth} percent. Expected harvest is ${selected.predictedYield} kilograms. ${
          alertCount > 0 ? 'Attention required for this colony.' : 'All conditions optimal.'
        }`;

    const voice = new SpeechSynthesisUtterance(textToSpeak);
    voice.lang = isHindi ? 'hi-IN' : 'en-IN';
    voice.onend = () => setAudioPlaying(false);
    voice.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(voice);
  };

  if (!selected) return null;

  return (
    <div className="hive-ledger animate-fadeUp">
      <header className="hive-ledger__header">
        <div>
          <p>{isHindi ? 'शर्मा एपियरी · कॉलोनी अभिलेख' : 'Sharma Apiary · colony records'}</p>
          <h1>
            {isHindi ? (
              <>कॉलोनी की स्थिति समझें,<br /><em>न कि सिर्फ लाइट।</em></>
            ) : (
              <>Read the colony,<br /><em>not a status light.</em></>
            )}
          </h1>
          <small>
            {isHindi
              ? 'प्रत्येक बक्से का मूल्यांकन वास्तविक निरीक्षण, पर्यावरणीय स्थिति और गतिविधि द्वारा किया जाता है।'
              : 'Each hive is reviewed through inspections, conditions and activity—not a generic health badge.'}
          </small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={toggleLanguage}
            className="tab-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.9rem' }}
          >
            <Globe2 size={15} aria-hidden="true" />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

          <div>
            <span>{mockHives.length}</span>
            <small>{isHindi ? 'पंजीकृत कॉलोनियां' : 'registered colonies'}</small>
          </div>
        </div>
      </header>

      <section className="hive-ledger__table" aria-label="Hive ledger">
        <div className="hive-ledger__table-head">
          <span>{isHindi ? 'बक्सा / कॉलोनी' : 'Hive'}</span>
          <span>{isHindi ? 'पुष्प स्रोत' : 'Floral source'}</span>
          <span>{isHindi ? 'अंतिम निरीक्षण' : 'Last inspection'}</span>
          <span>{isHindi ? 'अनुमानित उपज' : 'Expected yield'}</span>
          <span>{isHindi ? 'स्थिति' : 'Record state'}</span>
          <span />
        </div>
        {mockHives.map((hive) => (
          <button
            type="button"
            onClick={() => setSelectedId(hive.id)}
            key={hive.id}
            className={hive.id === selected.id ? 'is-selected' : ''}
          >
            <span>
              <strong>{hive.name}</strong>
              <small>{hive.id}</small>
            </span>
            <span>{getFloralLabel(hive.floralSource, isHindi)}</span>
            <span>
              {new Date(hive.lastInspection).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span>{hive.predictedYield} kg</span>
            <em className={`hive-ledger__state hive-ledger__state--${hive.status}`}>
              {stateLabel(hive, isHindi)}
            </em>
            <ChevronRight />
          </button>
        ))}
      </section>

      <section className="hive-ledger__detail">
        <header>
          <div>
            <p>{isHindi ? 'चयनित कॉलोनी' : 'Selected colony'} / {selected.id}</p>
            <h2>{selected.name}</h2>
            <small>
              {getFloralLabel(selected.floralSource, isHindi)} {isHindi ? 'स्रोत · स्थापित' : 'source · installed'}{' '}
              {new Date(selected.installedDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={playHiveAudio}
              className={`tab-btn ${audioPlaying ? 'is-selected' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.8rem' }}
              title={isHindi ? 'बक्से की स्थिति सुनें' : 'Listen to colony summary'}
            >
              <Volume2 size={14} aria-hidden="true" />
              <span>{audioPlaying ? (isHindi ? 'चल रहा है...' : 'Speaking...') : (isHindi ? 'आवाज में सुनें' : 'Audio Note')}</span>
            </button>
            <div className="hive-ledger__detail-health">
              <span>{isHindi ? 'अंतिम स्वास्थ्य स्कोर' : 'Last field health record'}</span>
              <strong>{selected.currentHealth}%</strong>
            </div>
          </div>
        </header>

        {latest ? (
          <div className="hive-ledger__telemetry">
            <div>
              <Thermometer />
              <span>{isHindi ? 'तापमान' : 'Temperature'}</span>
              <strong>{latest.temperature.toFixed(1)}°C</strong>
              <small>{isHindi ? 'नवीनतम रिकॉर्ड' : 'latest recorded condition'}</small>
            </div>
            <div>
              <Droplets />
              <span>{isHindi ? 'आर्द्रता' : 'Humidity'}</span>
              <strong>{latest.humidity.toFixed(0)}%</strong>
              <small>{isHindi ? 'नवीनतम रिकॉर्ड' : 'latest recorded condition'}</small>
            </div>
            <div>
              <Scale />
              <span>{isHindi ? 'बक्से का वजन' : 'Weight'}</span>
              <strong>{latest.weight.toFixed(1)} kg</strong>
              <small>{isHindi ? 'नवीनतम रिकॉर्ड' : 'latest recorded condition'}</small>
            </div>
            <div>
              <AudioLines />
              <span>{isHindi ? 'ध्वनि स्तर' : 'Acoustic activity'}</span>
              <strong>{latest.soundLevel.toFixed(0)} dB</strong>
              <small>{latest.activity} {isHindi ? 'नमूना' : 'activity sample'}</small>
            </div>
          </div>
        ) : (
          <div className="hive-ledger__no-telemetry">
            <Waves />
            <div>
              <strong>
                {isHindi
                  ? 'इस बक्से से कोई रिमोट सेंसर जुड़ा नहीं है।'
                  : 'No remote sensor history is attached to this hive.'}
              </strong>
              <small>
                {isHindi
                  ? 'इस कॉलोनी के अगले रिकॉर्ड के लिए भौतिक निरीक्षण व फील्ड नोट का उपयोग करें।'
                  : 'Use the physical inspection and field note for this colony’s next record.'}
              </small>
            </div>
          </div>
        )}

        <div className="hive-ledger__notes">
          <article>
            <CalendarDays />
            <div>
              <p>{isHindi ? 'निरीक्षण अभिलेख' : 'Inspection record'}</p>
              <strong>
                {isHindi ? 'अंतिम निरीक्षण: ' : 'Last inspected '}
                {new Date(selected.lastInspection).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
              <small>
                {isHindi
                  ? `इस कॉलोनी से ${selected.predictedYield} kg अनुमानित उपज।`
                  : `${selected.predictedYield} kg expected yield for this colony.`}
              </small>
            </div>
          </article>

          <article>
            <Leaf />
            <div>
              <p>{isHindi ? 'कॉलोनी स्वास्थ्य मूल्यांकन' : 'Colony assessment'}</p>
              <strong>
                {selected.diseaseRisk === 'low'
                  ? (isHindi ? 'रोग का कोई लक्षण नहीं मिला' : 'No disease concern logged')
                  : (isHindi ? 'फॉलो-अप निरीक्षण की सिफारिश' : 'Inspection follow-up recommended')}
              </strong>
              <small>
                {insight?.recommendation
                  ? translateRecommendation(insight.recommendation, isHindi)
                  : (isHindi
                    ? 'मानक फील्ड निरीक्षण कार्यक्रम जारी रखें।'
                    : 'Continue the standard field inspection schedule.')}
              </small>
            </div>
          </article>
        </div>

        {insight?.alerts.length ? (
          <div className="hive-ledger__attention">
            <CircleAlert />
            <div>
              <p>{isHindi ? 'आवश्यक ध्यान' : 'Field attention'}</p>
              {insight.alerts.map((alert) => (
                <strong key={alert}>
                  {translateAlert(alert, isHindi)}
                </strong>
              ))}
            </div>
          </div>
        ) : (
          <div className="hive-ledger__routine">
            <Activity />
            <span>
              {isHindi
                ? 'वर्तमान फील्ड रिकॉर्ड के अनुसार इस बक्से में किसी अतिरिक्त कार्रवाई की आवश्यकता नहीं है।'
                : 'Current field record shows no additional action for this hive.'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
