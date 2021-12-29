import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import index_en from "../translations/en";
import profile_en from "../translations/en/profile";
import event_en from "../translations/en/event";
import entry_en from "../translations/en/entry";
import notes_en from "../translations/en/notes";
import groups_en from "../translations/en/groups";
import settings_en from "../translations/en/settings";
import introduction_en from "../translations/en/introduction";

import index_fi from "../translations/fi";
import profile_fi from "../translations/fi/profile";
import event_fi from "../translations/fi/event";
import entry_fi from "../translations/fi/entry";
import notes_fi from "../translations/fi/notes";
import groups_fi from "../translations/fi/groups";
import settings_fi from "../translations/fi/settings";
import introduction_fi from "../translations/fi/introduction";

i18n.use(initReactI18next);

i18n.init({
    interpolation:{escapeValue: false},

    lng: 'en',
    resources: {
        en: {
            index: index_en,
            profile: profile_en,
            event: event_en,
            entry: entry_en,
            notes: notes_en,
            groups: groups_en,
            settings: settings_en,
            introduction: introduction_en,
        },
        fi: {
            index: index_fi,
            profile: profile_fi,
            event: event_fi,
            entry: entry_fi,
            notes: notes_fi,
            groups: groups_fi,
            settings: settings_fi,
            introduction: introduction_fi,
        },
    },
});

//https://react.i18next.com/latest/using-with-hooks
// käytetäänko useTranslations vai withTranslations vai Trans?

export default i18n;