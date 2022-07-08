/*property

*/


const Home = (function () {
    "use strict";

    /*------------------------------------------------------------------------
     *              CONSTANTS
     */
    const BLANK_IMAGE_URL = '';
    const CHARACTERS_JSON_URL = "https://raw.githubusercontent.com/isaacmcdgl/JSON/main/Genshin/characters.json"
    const CHARACTERS_THUMBNAIL_URL = "https://raw.githubusercontent.com/isaacmcdgl/JSON/main/Genshin/Thumbnails/Character_CHARNAME_Thumb.png";
    /*------------------------------------------------------------------------
     *              PRIVATE VARIABLES
     */

    let charsLoaded;
    let character_list;
    let locked_char_names;
    let valid_character_list;
    let error;
    /*------------------------------------------------------------------------
     *              PRIVATE METHOD DECLARATIONS
     */
    let decodeNextRole;
    let changeRole;
    let changeRarity;
    let clearTeam;
    let generateTeam;
    let init;
    let loadCharacters;
    let loadRoles;
    let loadSettings;
    let loadCharacterToggles;
    let loadTeam;
    let randomArrayItem;
    let presetTeam;
    let checkElementInArray;
    let validateCharacterList;
    let toggleSettings;
    let toggleAside;
    let toggleUnlockedCharacter;

    /*------------------------------------------------------------------------
     *              PRIVATE METHOD DECLARATIONS
     */

    changeRole = (element) => {
        let role = element.getAttribute('data-role');
        let newRole = decodeNextRole(role);
        element.setAttribute('data-role', newRole);
        element.innerHTML = newRole;
        Global.setValue(`role_${element.getAttribute('data-slot')}_setting`, newRole)
    }


    changeRarity = (element) => {
        let rarity = element.getAttribute('data-rarity');
        let newRarity;
        if (rarity == 'Any') {
            newRarity = '5';
        } else if (rarity == '5') {
            newRarity = '4'
        } else {
            newRarity = 'Any'
        }

        let rarity_string;

        if (newRarity == 'Any') {
            rarity_string = newRarity;
        } else {
            rarity_string = newRarity + ' Stars Only';
        }

        Global.setValue(element.getAttribute('id') + '_rarity', newRarity);

        element.querySelector('.rarity_setting').innerHTML = rarity_string;
        element.setAttribute('data-rarity', newRarity)
    }

    clearTeam = () => {
        let teams = document.getElementsByClassName('character_slot');
        for (let i = 0; i < teams.length; i++) {
            let team = teams[i];
            team.querySelector('img').setAttribute('src', BLANK_IMAGE_URL);
            team.querySelector('.character_name').innerHTML = '';
        }
    }

    checkElementInArray = (name, array) => {
        let notFound = true;
        let j = 0;
        while(notFound){
            if(j >= array.length){
                notFound = false;
                return false;
            }
            else{
                if(name == array[j].name){
                    notFound = false;
                    return true;
                }
                j++;
            }
        }
    }

    decodeNextRole = (role) => {
        switch (role) {
            case "Any":
                return 'DPS';
                break;
            case "DPS":
                return 'Sub-DPS';
                break;
            case "Sub-DPS":
                return 'Support';
                break;
            case "Support":
                return 'Healer';
                break;
            case "Healer":
                return 'Any';
                break;
        }
    }

    generateTeam = () => {
        let chars = [];
        for (let i = 1; i <= 4; i++) {
                document.getElementById(`role_${i}`).classList.remove('hidden');
            let role = document.getElementById(`role_${i}`).getAttribute('data-role');
            let rarity = document.getElementById(`char_settings_${i}`).getAttribute('data-rarity');
            let charNotFound = true;
            let j = 0;
            while (charNotFound) {
                let char = randomArrayItem(valid_character_list);
                if (!chars.includes(char)) {
                    if (role != 'Any') {
                        if (char.role == role) {
                            if (rarity != 'Any') {
                                if (char.rarity == parseInt(rarity)) {
                                    chars.push(char);
                                    charNotFound = false;
                                }
                            } else {
                                chars.push(char);
                                charNotFound = false;
                            }

                        }
                    } else {
                        chars.push(char);
                        charNotFound = false;
                    }
                }
                j++;
                if (j >= 200) {
                    charNotFound = false;
                    error = true;
                }
            }

        }
        loadTeam(chars, error);
    }

    init = function (onInitializedCallback) {
        console.log("Started home init...");
        window.scrollTo(0, 0);
        loadCharacters();
        loadRoles();
        loadSettings();
    };

    loadCharacters = () => {
        charsLoaded = false;
        let chars_stored = Global.getValue('character_list');
        if (chars_stored) {
            character_list = JSON.parse(chars_stored);
            clearTeam();
            charsLoaded = true;
            validateCharacterList();
        } else {
            let url = CHARACTERS_JSON_URL;
            Global.ajax(url, function (data) {
                character_list = data;
                Global.setValue('character_list', JSON.stringify(character_list))
                clearTeam();
                charsLoaded = true;
                validateCharacterList();
            })
        }
    }

    loadCharacterToggles = () =>{
        let html = '';
        character_list.forEach(element => {
            let disabled = true;
            if(checkElementInArray(element.name, valid_character_list)){
                disabled = false;
            }
            html += `<div data-name="${element.name}" onclick="toggleUnlockedCharacter(this)" 
            class="character_toggle_icon ${disabled ? 'disabled' : ''}"><img src="${CHARACTERS_THUMBNAIL_URL.replaceAll('CHARNAME', element.name).replaceAll(' ', '_')}"></div>`
        });
        document.getElementById('character_toggles').innerHTML = html;
    }

    loadRoles = () => {
        for (let i = 0; i < 4; i++) {
            let role = Global.getValue(`role_${i + 1}_setting`);
            if (!role) {
                role = "Any"
            }
            document.getElementById(`role_${i + 1}`).innerHTML = role;
            document.getElementById(`role_${i + 1}`).setAttribute('data-role', role);

        }
    }

    loadSettings = () => {
        for (let i = 0; i < 4; i++) {
            let rarity = Global.getValue(`char_settings_${i + 1}_rarity`);
            if (!rarity) {
                rarity = "Any"
            }

            let rarity_string;

            if (rarity == 'Any') {
                rarity_string = rarity;
            } else {
                rarity_string = rarity + ' Stars Only';
            }
            document.getElementById(`char_settings_${i + 1}`).querySelector('.rarity_setting').innerHTML = rarity_string;
            document.getElementById(`char_settings_${i + 1}`).setAttribute('data-rarity', rarity);

        }
    }

    loadTeam = (chars) => {
        if(error){
            document.getElementById('error_message').classList.remove('hidden');
        }else{
            document.getElementById('error_message').classList.add('hidden');
            for (let i = 1; i <= 4; i++) {
                let element = document.getElementById(`char_slot_${i}`);
    
                element.querySelector('.character_settings').classList.add('hidden')
                let char = chars[i - 1];
                let img = element.querySelector('img');
                if (char.image) {
                    img.setAttribute('src', char.image);
                } else {
                    img.setAttribute('src', CHARACTERS_THUMBNAIL_URL.replaceAll('CHARNAME', char.name).replaceAll(' ', '_'));
                }
                img.className = 'image_rarity_' + char.rarity;
                let name = element.querySelector('.character_name');
                name.innerHTML = char.name;
                name.className = 'character_name';
                name.classList.add('character_name_' + char.element.toLowerCase());
            }
        }

    }

    presetTeam = (preset, type) => {
        let chars = [];
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`role_${i}`).classList.add('hidden');
            let charNotFound = true;
            let j = 0;;
            while (charNotFound) {
                let char = randomArrayItem(valid_character_list);
                if (!chars.includes(char)) {
                    if (type == 'element') {
                        if (char.element.toLowerCase() == preset) {
                            chars.push(char);
                            charNotFound = false;
                        }
                    } else {
                        if (char.weapon.toLowerCase() == preset) {
                            chars.push(char);
                            charNotFound = false;
                        }
                    }
                }
                j++;
                if (j >= 200) {
                    charNotFound = false;
                    error = true;
                }
            }

        }
        loadTeam(chars);
    }

    randomArrayItem = (items) => {
        // "~~" for a closest "int"
        return items[~~(items.length * Math.random())];
    }

    toggleAside = (side) => {
        if(side == 'right'){
            let aside = document.getElementById('right_aside');
            if(aside.classList.contains('offScreen')){
                aside.classList.remove('offScreen')
            }else{
                aside.classList.add('offScreen')
            }
        }
    }

    toggleSettings = (settingsDiv) => {
        if (settingsDiv.classList.contains('hidden')) {
            settingsDiv.classList.remove('hidden');
        } else {
            settingsDiv.classList.add('hidden');
        }
    }

    toggleUnlockedCharacter = (element) =>{

        let char;
        let charName = element.getAttribute('data-name');
        character_list.forEach(char_elem => {
            if(charName == char_elem.name){
                char = char_elem;
            }
        });


        if(element.classList.contains('disabled')){
            element.classList.remove('disabled')
            valid_character_list.push(char);
        }else{
            let new_valid_list = [];
            valid_character_list.forEach(valid_element => {
                if(valid_element.name != char.name){
                    new_valid_list.push(valid_element);
                }
            });
            valid_character_list = new_valid_list;
            element.classList.add('disabled')
        }


        Global.setValue('char_unlocked',JSON.stringify(valid_character_list))
    }

    validateCharacterList = () => {
        let char_unlocked = JSON.parse(Global.getValue('char_unlocked'));
        if(char_unlocked){
            valid_character_list = char_unlocked;
        }else{
            valid_character_list = character_list;
        }

        loadCharacterToggles();
    }

    /*------------------------------------------------------------------------
     *              PUBLIC METHODS
     */
    return {
        changeRole,
        changeRarity,
        init,
        generateTeam,
        toggleSettings,
        presetTeam,
        toggleUnlockedCharacter,
        toggleAside,
    };
}());
