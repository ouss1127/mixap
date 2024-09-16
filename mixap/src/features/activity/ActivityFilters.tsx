//import React from 'react';
import { t } from 'i18next';

import {FolderOutlined} from '@ant-design/icons';
import React from 'react';
/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

/**
 * Initialise les filtres
 * Attention ne nombre d'élément dans tabClassBodyElements et tabIdFilter doivent être égaux afin de retoruver leur lien
 * @param tabClassBodyElements les noms des classes du noeud body a surveiller 
 * @param tabIdFilter les identifiants des filters à init et donc à mettre en décochés
 */

let numberActivityExploited = 0;

export const init = (tabClassBodyElements: string[], tabIdFilter: string[],resetId: string) => {

    const handlerToken = 'js-handler-save';
    const cible = document.body;

    const listenFilter = function (e) {
        // Verifie provenance du click
        if (!e.target.closest('.mix-tab_filters')) return;

        const reset = document.getElementById(resetId);
        if(reset !== null){
            reset?.addEventListener('change', () => {resetClickFilter(
                tabClassBodyElements,
                tabIdFilter
            )});
        }
        

        const concatFilterElement: Array<string[]> = [];
        concatFilterElement.push(tabIdFilter);
        concatFilterElement.push(tabClassBodyElements);

        const result = concatFilterElement[0].map(function (el, index) {
            return [el, concatFilterElement[1][index]];
        });

        for (let index = 0; index < result.length; index++) {

            clickFilter(e,result[index][0],result[index][1]);
        }
        
    }

    // Applique le listener (seulement si absent)
    if (!cible.classList.contains(handlerToken)) {
        cible.classList.add(handlerToken)
        cible.addEventListener('change', listenFilter, true)
    }

    const res: string[] = [];
    tabIdFilter.forEach((item) => {
        const temp: string[] = item.split(/(?=[A-Z])/);
        res.push(temp[0]+' '+temp[1]);
    })

    tabClassBodyElements.forEach((classBodyName) => {

        if (document.body.classList.contains(classBodyName)) {

            const tempBdItem = classBodyName.split('-')[1];
            const upperCaseBditem = tempBdItem[0].toUpperCase() + tempBdItem.slice(1);

            res.forEach((item) => {
                if(item.match(upperCaseBditem)){

                    const id = item.replace(/\s/g, '');

                    if(document.getElementById(id) !== null){
                        (document.getElementById(id) as HTMLInputElement).checked = false;
                    }
                }
            })   
        }
   
    });

    numberActivityExploited = document.querySelectorAll('.Exploiter').length;

}

/**
 * Permet d'enclencher un filtre
 * @param e filtre selectionné
 * @param idElement ID du filtre sélectionné
 * @param classValue classe ajouté dans le noeud body
 */
const clickFilter = (e, idElement, classValue) => {
    if (e.target.closest(idElement)){
        const check = e.target;
        check.checked && document.body.classList.add(classValue);
        !check.checked && document.body.classList.remove(classValue);
        resetFilters();
    }
    
}

/**
 * Lors du clique sur le reset filter les filtres sont désactivés
 * @param tabClassReset liste des classes ajouté dans le noeud body à retirer
 * @param tabIdElement liste des ID des filtres à décocher 
 */
const resetClickFilter = (tabClassReset: string[], tabIdElement: string[]) => {

    tabIdElement.forEach((id) => {
        if ((document.getElementById(id.slice(1)) as HTMLInputElement).checked) {
            (document.getElementById(id.slice(1)) as HTMLInputElement).checked = false;
        }
        
    })

    tabClassReset.forEach((className) => {
        document.body.classList.remove(className);
    });
}

/**
 * Permet de réinitialiser les filtres
 */
const resetFilters = () => {
    const resetFiltres = document.getElementById('resetFiltres') as HTMLInputElement | null;
    if ((document.body.classList.contains('-augmenter')) || 
    (document.body.classList.contains('-valider')) || 
    (document.body.classList.contains('-associer')) || 
    (document.body.classList.contains('-superposer')) ||
    (document.body.classList.contains('-exploiter')) ) { 
        if (resetFiltres != null) {
            resetFiltres.checked = true;
        }
    }else{
        if (resetFiltres != null) {
            resetFiltres.checked = false;
        }
    }
}

/**
 * Filtres pour les cartes Activités
 */
class ActivityFilters extends React.Component {

    render()
    {
        return (
            <div className='mix-tab_filters'>
                
                <label className="mix-filters_reset"><input type="checkbox" id="resetFiltres" value="reset"></input><h4>{t('common.filters')}&nbsp;: </h4></label>
    
                <label><input type="checkbox" id="filtreAugmenter" value="augmenter"></input>{t('common.augmentation')}</label>  
                <label><input type="checkbox" id="filtreValider" value="valider"></input>{t('common.validation')}</label>     
                <label><input type="checkbox" id="filtreAssocier" value="associer"></input>{t('common.association')}</label>     
                <label><input type="checkbox" id="filtreSuperposer" value="superposer"></input>{t('common.superposition')}</label>
                <div className="mix-spacer -hrz"></div>
                <label className="mix-tab_filter -exploiter"><input type="checkbox" id="filtreExploiter" value="exploiter"></input>{t('common.use')}&nbsp;<FolderOutlined />&nbsp;:&nbsp;{numberActivityExploited}</label>          
            </div>
           
        );
    }

}

export default ActivityFilters;