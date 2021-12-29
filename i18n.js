import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(LanguageDetector).init({

    resources: {

        en: {
            translations: {
                //etusivu
                Profile: "Profile",
                Event: "Event",
                Entry: "Entry",
                Notes: "Muistiinpanot",
                Notifications: "Notifications",
                Settings: "Settings",

                //profiili
                Edit: "Edit profile",
                FirstName: "First name",
                LastName: "Last name",
                Email: "Email",
                Save: "Save changes",
                Cancel: "Cancel",

                //tapahtuma
                Texts: "Create a new event",
                "Event date",
                "Starting time",
                "Ending time (optional)",
                "Event description (optional)",
                "Category",
                "Guests",
                "Save",


            }
        }


        fi: {
            translations: {
                //etusivu
                "Profile": "Profiili",
                "Event": "Tapahtuma",
                "Entry": "Merkintä",
                "Notes": "Muistiinpanot",
                "Notifications": "Ilmoitukset",
                "Settings": "Asetukset",

                //profiili
                "Edit profile": "Muokkaa profiilia",
                "First name": "Etunimi",
                "Last name": "Sukunimi",
                "Email": "Sähköposti",
                "Save": "Tallenna muutokset,
                "Cancel": "Peruuta",

                //tapahtuma
                "Create a new event": "Luo uusi tapahtuma",
                    "Event date": "Tapahtuman päivämäärä",
                    "Starting time": "Ending time (optional)",
                    "Aloitusaika": "Lopetusaika (ei pakollinen",
                    "Event description (optional)": "Tapahtuman kuvaus (ei pakollinen)",
                    "Category": "Kategoria",
                    "Guests": "Vieraat",
                    "Save": "Tallenna"

            }
        }
    }

    fallbackLng: 'en',
    debug: true,

    ns: ['translations'],
    defaultNS:'translations',

    keySeparator: false,

    interpolation:{
        escapeValue: false, //ei tarvita reactilla?
        formatSeparator: ','
    }

    react:{
        wait: true,
    }

});

export default i18n;