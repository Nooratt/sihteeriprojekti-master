import React from "react";
import '../css/event.css';
import { withTranslation } from 'react-i18next';
import Tooltip from "react-simple-tooltip";

/**
 * @author Julia Virtanen
 * Class for the Help React component
 *  - a floating popup view
 */
class Help extends React.Component {

    render() {
        const {t, i18n} = this.props;
        return (
            <div className="tab">

                    <br/>
                    <h3>{t('introduction:introtitle')}</h3>

                        <p>{t('introduction:intro1')}
                        {t('introduction:intro2')}</p>

                <h4>{t('introduction:calendartitle')}</h4>
                        <p>{t('introduction:calendar1')}
                        {t('introduction:calendar2')}
                        {t('introduction:calendar3')}
                        {t('introduction:calendar4')}
                        {t('introduction:calendar5')}
                        {t('introduction:calendar6')}
                        {t('introduction:calendar7')}
                        {t('introduction:calendar8')}</p>

                <h4>{t('introduction:profiletitle')}</h4>
                        <p>{t('introduction:profile1')}
                        {t('introduction:profile2')}
                        {t('introduction:profile3')}
                        {t('introduction:profile4')}</p>

                <h4>{t('introduction:settingstitle')}</h4>
                        <p>{t('introduction:settings1')}
                        {t('introduction:settings2')}
                        {t('introduction:settings3')}
                        {t('introduction:settings4')}
                        {t('introduction:settings5')}
                        {t('introduction:settings6')}
                        {t('introduction:settings7')}
                        {t('introduction:settings8')}
                        {t('introduction:settings9')}
                        {t('introduction:settings11')}</p>

                <h4>{t('introduction: grouptitle')}</h4>
                        <p>{t('introduction:group1')}
                        {t('introduction:group2')}
                        {t('introduction:group3')}</p>




                </div>


        );
    }
}

export default withTranslation()(Help);