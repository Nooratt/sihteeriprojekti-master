import React from 'react';
import '../css/event.css';
import {withTranslation} from 'react-i18next';
import {postToBackend} from "./Ajax";
import Tooltip from "react-simple-tooltip";


let self;
let en, et, ed, tu, mu, hi;

/**
 * @author Noora Turunen
 * @class Note
 * Class for the Note component
 *
 */
class Note extends React.Component {
    constructor(props) {
        super(props);

        //this.saveNote = this.saveNote.bind(this);
        this.makeNote = this.makeNote.bind(this);
      //  this.printNote = this.printNote.bind(this);


        this.state = {
            notelist:"",
        }


    }
    render() {
        const {t, i18n} = this.props;
        const notes = this.notes;
        return(

            <div id="Create_note" className="tabcontent">
                <h1>{t('notes:title')}</h1>
                <form>
                    <div className={"topnav"}>
                        <p>{t('notes:note')}</p>
                        <input type="text" id="notetext" placeholder={t('notes:notefield')} />
                        <br/>
                        <input type="tag" id="tag" placeholder={t('notes:field')}/>
                        <br/>
                        <input type="text" id="tunniste" placeholder={t('notes:tag')} pattern=".{2,}"/>
                        <input type="checkbox" id="hidden"/>
                        <br/>
                        <button id="save" type="button" onClick={this.makeNote}>{t('notes:box')}</button>
                        <p>{this.notelist}</p>
                    </div>
                </form>
            </div>
        )
    }

        /**
         * Makes note when save is clicked
         * @author Julia Virtanen
         */
        makeNote() {
            var newnote = document.getElementById('notetext').value;
            var notelist = new Array();
            notelist.push(newnote);
            console.log(notelist.toString());
        }


}

export default withTranslation()(Note);
