class Card
{
    constructor(buildACardApp, cardData, artData)
    {
        this.buildACardApp = buildACardApp;
        this.artData = artData;
        
        this.id = cardData.id;
        this.name = cardData.name;
        this.description = typeof cardData.text === "undefined" ? "" : cardData.text;
        this.description = this.buildACardApp.fixCardDescription(this.description);
        this.attack = cardData.attack;
        this.cardClass = cardData.cardClass;
        this.isCollectible = cardData.collectible
        this.cost = cardData.cost;
        this.isElite = cardData.elite;
        this.health = cardData.health;
        this.mechanics = typeof cardData.mechanics === "undefined" ? [] : cardData.mechanics;
        this.rarity = cardData.rarity;
        this.set = cardData.set;
        this.race = cardData.race;
        this.type = cardData.type;
    }
    
    createHTML(onLoad)
    {
        this.html = $(`
            <div class="hs-card">
                <img src="images/loading.png" />
                <canvas class="hs-card" width="256" height="382"></canvas>
            </div>
        `);
        this.canvasHTML = this.html.find("canvas");
        
        this.buildACardApp.getImageCached(this.artData.texture, (artImgHTML) =>
        {
            const canvas = this.canvasHTML[0];
            const context = canvas.getContext("2d");
            const artCanvas = this.buildACardApp.cache.artRendererHTML[0];
            const artContext = artCanvas.getContext("2d");
            
            artContext.clearRect(0, 0, artCanvas.width, artCanvas.height);
            artContext.drawImage(artImgHTML[0], this.artData.x, this.artData.y, this.artData.width, this.artData.height);
            
            this.buildACardApp.sunwell.createCard(
                {
                    "id": this.id,
                    "name": this.name,
                    "text": this.description,
                    "attack": this.attack,
                    "cardClass": this.cardClass,
                    "collectible": this.isCollectible,
                    "cost": this.cost,
                    "elite": this.isElite,
                    "health": this.health,
                    "mechanics": this.mechanics,
                    "rarity": this.rarity,
                    "set": this.set,
                    "type": this.type,
                    "texture": artCanvas.toDataURL()
                },
                canvas.width,
                false,
                canvas,
                () =>
                {
                    this.html.find("img").css("display", "none");
                    
                    if(typeof onLoad !== "undefined")
                    {
                        onLoad(this.html);
                    }
                }
            );
        });
        
        return this.html;
    }
    
    getSpellDamage()
    {
        let spellDamage = 0;
        
        if(this.mechanics.includes("SPELLPOWER"))
        {
            const regex = this.description.match(/\d+/);
            
            if(regex)
            {
                spellDamage += parseInt(regex[0]);
            }
        }
        
        return spellDamage;
    }
    
    getRaceName()
    {
        switch(this.race)
        {
            case "MECHANICAL":
                return "Mech";
            
            default:
                return this.race.charAt(0).toUpperCase() + this.race.slice(1).toLowerCase();
        }
    }
}

class BuildACardApp
{
    constructor(sunwell)
    {
        this.cache = {};
        this.pools = {};
        this.imageCache = {};
        this.sunwell = sunwell;
        
        this.setupCache();
        this.gotoLoadingPage();
        this.setupMainPage();
        this.loadCardJSON();
    }
    
    setupCache()
    {
        this.cache.bodyHTML = $(document.body)
        this.cache.pageTitleHTML = $("#page-title");
        this.cache.pageDescriptionHTML = $("#page-description");
        this.cache.cardChoice1HTML = $("#card-choice-1");
        this.cache.cardChoice2HTML = $("#card-choice-2");
        this.cache.cardChoice3HTML = $("#card-choice-3");
        this.cache.cardResultInfoHTML = $("#card-result-info");
        this.cache.cardResultHTML = $("#card-result");
        this.cache.buildACardAnotherHTML = $("#build-a-card-another");
        this.cache.buildACardDownloadHTML = $("#build-a-card-download");
        this.cache.buildACardBacktHTML = $("#build-a-card-back");
        this.cache.artRendererHTML = $("#art-renderer")
    }
    
    getRandomElementAndRemove(list)
    {
        const index = Math.floor(Math.random() * list.length);
        const value = list[index];
        
        list.splice(index, 1);
        
        return value;
    }
    
    setPageState(id)
    {
        $("#page-states .page-state").each((pageStateHTMLIndex, pageStateHTML) =>
        {
            
            $(pageStateHTML).css("display", "none");
        });
        
        $("#" + id).css("display", "");
    }
    
    setPageInfo(title, description)
    {
        this.cache.pageTitleHTML.html(title);
        this.cache.pageDescriptionHTML.html(description);
    }
    
    gotoLoadingPage()
    {
        this.setPageState("page-state-loading");
        this.setPageInfo("Loading...", "");
    }
    
    gotoMainPage()
    {
        window.scrollTo(0, 0);
        
        if(location.hash === "")
        {
            this.setPageState("page-state-main");
            this.setPageInfo("Build-A-Card Simulator", "Choose a card to start.");
        }
        else
        {
            $(window).trigger("hashchange");
        }
    }
    
    gotoBuildABeastPage()
    {
        window.scrollTo(0, 0);
        
        this.setHash("build-a-beast");
        
        //Beasts with only card text
        if(typeof this.pools.buildABeast1 === "undefined")
        {
            this.pools.buildABeast1 = this.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "HUNTER")
                {
                    return false;
                }
                
                if(cardData.race !== "BEAST" && cardData.race !== "ALL")
                {
                    return false;
                }
                
                if(typeof cardData.text === "undefined")
                {
                    return false;
                }
                
                if(cardData.cost > 5)
                {
                    return false;
                }
                
                if(typeof cardData.mechanics !== "undefined")
                {
                    for(let [mechanicIndex, mechanic] of cardData.mechanics.entries())
                    {
                        if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY")
                        {
                            return false;
                        }
                    }
                }
                
                return true;
            });
        }
        
        //Beasts that are blank or only has keywords
        if(typeof this.pools.buildABeast2 === "undefined")
        {
            this.pools.buildABeast2 = this.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "HUNTER")
                {
                    return false;
                }
                
                if(cardData.race !== "BEAST" && cardData.race !== "ALL")
                {
                    return false;
                }
                
                if(cardData.cost > 5)
                {
                    return false;
                }
                
                let description = typeof cardData.text === "undefined" ? "" : cardData.text;
                
                if(typeof cardData.mechanics !== "undefined")
                {
                    for(let [mechanicIndex, mechanic] of cardData.mechanics.entries())
                    {
                        description = description.replace(new RegExp(mechanic.replace(new RegExp("_", "g"), " "), "ig"), "");
                        
                        if(mechanic !== "CHARGE" && mechanic !== "DIVINE_SHIELD" && mechanic !== "ECHO" && mechanic !== "LIFESTEAL" && mechanic !== "POISONOUS" && mechanic !== "RUSH" && mechanic !== "STEALTH" && mechanic !== "TAUNT" && mechanic !== "WINDFURY")
                        {
                            return false;
                        }
                    }
                }
                
                //Remove everything a card with only keyworlds will have
                
                description = description.replace(new RegExp("<b>", "g"), "");
                description = description.replace(new RegExp("</b>", "g"), "");
                description = description.replace(new RegExp("\\.", "g"), "");
                description = description.replace(new RegExp("\\,", "g"), "");
                description = description.replace(new RegExp(" ", "g"), "");
                description = description.replace(new RegExp("\n", "g"), "");
                
                
                //If the description still have text
                if(description.length > 0)
                {
                    return false;
                }
                
                return true;
            });
        }
        
        const pool1 = this.pools.buildABeast1.slice();
        const pool2 = this.pools.buildABeast2.slice();
        
        this.setPageInfo("Build-A-Beast", "Choose a beast with text:");
        this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), (card1) =>
        {
            
            this.setPageInfo("Build-A-Beast", "Choose a beast with only keywords or no text:");
            this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), (card2) =>
            {
                this.setPageState("page-state-result");
                this.setPageInfo("Build-A-Beast", "Result:");
                
                let mechanics = this.getUniqueArray(card1.mechanics.concat(card2.mechanics));
                let displayedMechanics = []
                let spellDamage = card1.getSpellDamage() + card2.getSpellDamage();
                let description = "";
                
                for(let [mechanicIndex, mechanic] of mechanics.entries())
                {
                    if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY")
                    {
                        displayedMechanics.push(mechanic);
                    }
                }
                
                for(let [mechanicIndex, mechanic] of displayedMechanics.entries())
                {
                    description += "<b>" + this.getMechanicName(mechanic) + (mechanicIndex === displayedMechanics.length - 1 ? "</b>\n" : "</b>, ");
                }
                
                if(spellDamage > 0)
                {
                    const spellDamageText = "<b>Spell Damage +" + spellDamage + "</b>\n";
                    
                    if(description.indexOf("\n") === -1)
                    {
                        description += spellDamageText;
                    }
                    else
                    {
                        description.replace(new RegExp("\n", "g"), ", " + spellDamageText);
                    }
                }
                
                description += card1.description.replace(new RegExp("\n", "g"), " ");
                description = this.fixCardDescription(description);
                
                const zombeast = new Card(this, {
                    id: "ICC_800h3t",
                    name: "Zombeast",
                    text: description,
                    attack: card1.attack + card2.attack,
                    cardClass: card1.cardClass,
                    collectible: false,
                    cost: card1.cost + card2.cost,
                    elite: card1.isElite,
                    health: card1.health + card2.health,
                    mechanics: mechanics,
                    rarity: card1.rarity,
                    set: "ICECROWN",
                    race: "BEAST",
                    type: "MINION"
                }, card1.artData);
                
                this.cache.cardResultInfoHTML.html("<h2>" + card1.name + "<br />+<br />" + card2.name + "</h2>");
                
                this.cache.cardResultHTML.empty();
                this.cache.cardResultHTML.append(zombeast.createHTML());
                
                this.cache.buildACardAnotherHTML.off("click");
                this.cache.buildACardAnotherHTML.on("click", () =>
                {
                    this.gotoBuildABeastPage();
                });
                
                this.cache.buildACardDownloadHTML.off("click");
                this.cache.buildACardDownloadHTML.on("click", () =>
                {
                    this.downloadCanvas(zombeast.html[0], "Zombeast-" + card1.id + "-" + card2.id + ".png");
                });
                
                this.cache.buildACardBacktHTML.off("click");
                this.cache.buildACardBacktHTML.on("click", () =>
                {
                    this.setHash("");
                    this.gotoMainPage();
                });
                
                zombeast.html[0].scrollIntoView();
            });
        });
    }
    
    gotoKazakusPotion()
    {
        window.scrollTo(0, 0);
        
        this.setHash("kazakus");
        
        //Cost potions
        if(typeof this.pools.kazakusCost === "undefined")
        {
            this.pools.kazakusCost = this.pools.allCards.filter((cardData) =>
            {
                if(
                    cardData.id !== "CFM_621t11" &&
                    cardData.id !== "CFM_621t12" &&
                    cardData.id !== "CFM_621t13"
                )
                {
                    return false;
                }
                
                return true;
            });
        }
        
        //1-mana effects
        if(typeof this.pools.kazakus1Mana === "undefined")
        {
            this.pools.kazakus1Mana = this.pools.allCards.filter((cardData) =>
            {
                if(
                    cardData.id !== "CFM_621t10" &&
                    cardData.id !== "CFM_621t2" &&
                    cardData.id !== "CFM_621t3" &&
                    cardData.id !== "CFM_621t37" &&
                    cardData.id !== "CFM_621t4" &&
                    cardData.id !== "CFM_621t5" &&
                    cardData.id !== "CFM_621t6" &&
                    cardData.id !== "CFM_621t8" &&
                    cardData.id !== "CFM_621t9"
                )
                {
                    return false;
                }
                
                return true;
            });
        }
        
        //5-mana effects
        if(typeof this.pools.kazakus5Mana === "undefined")
        {
            this.pools.kazakus5Mana = this.pools.allCards.filter((cardData) =>
            {
                if(
                    cardData.id !== "CFM_621t16" &&
                    cardData.id !== "CFM_621t17" &&
                    cardData.id !== "CFM_621t18" &&
                    cardData.id !== "CFM_621t19" &&
                    cardData.id !== "CFM_621t20" &&
                    cardData.id !== "CFM_621t21" &&
                    cardData.id !== "CFM_621t22" &&
                    cardData.id !== "CFM_621t23" &&
                    cardData.id !== "CFM_621t24" &&
                    cardData.id !== "CFM_621t38"
                )
                {
                    return false;
                }
                
                return true;
            });
        }
        
        //10-mana effects
        if(typeof this.pools.kazakus10Mana === "undefined")
        {
            this.pools.kazakus10Mana = this.pools.allCards.filter((cardData) =>
            {
                if(
                    cardData.id !== "CFM_621t25" &&
                    cardData.id !== "CFM_621t26" &&
                    cardData.id !== "CFM_621t27" &&
                    cardData.id !== "CFM_621t28" &&
                    cardData.id !== "CFM_621t29" &&
                    cardData.id !== "CFM_621t30" &&
                    cardData.id !== "CFM_621t31" &&
                    cardData.id !== "CFM_621t32" &&
                    cardData.id !== "CFM_621t33" &&
                    cardData.id !== "CFM_621t39"
                )
                {
                    return false;
                }
                
                return true;
            });
        }
        
        this.setPageInfo("Kazakus", "Choose a cost:");
        this.setupCardChoice(this.createCardFromJSONData(this.pools.kazakusCost[0]), this.createCardFromJSONData(this.pools.kazakusCost[1]), this.createCardFromJSONData(this.pools.kazakusCost[2]), (card1) =>
        {
            const potionCost = card1.cost;
            let effectPool;
            
            if(potionCost === 1)
            {
                effectPool = this.pools.kazakus1Mana.slice();
            }
            else if(potionCost === 5)
            {
                effectPool = this.pools.kazakus5Mana.slice();
            }
            else
            {
                effectPool = this.pools.kazakus10Mana.slice();
            }
            
            const choicePool1 = effectPool.slice();
            
            this.setPageInfo("Kazakus", "Choose the first effect:");
            this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool1)), (card2) =>
            {
                let choicePool2 = effectPool.slice();
                choicePool2 = choicePool2.filter((cardData) => cardData.id !== card2.id);
                
                this.setPageInfo("Kazakus", "Choose the second effect:");
                this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(choicePool2)), (card3) =>
                {
                    this.setPageState("page-state-result");
                    this.setPageInfo("Kazakus", "Result:");
                    
                    let id;
                    
                    if(potionCost === 1)
                    {
                        id = "CFM_621t";
                    }
                    else if(potionCost === 5)
                    {
                        id = "CFM_621t14";
                    }
                    else
                    {
                        id = "CFM_621t15";
                    }
                    
                    const type = "SPELL";
                    
                    const potion = new Card(this, {
                        id: id,
                        name: "Kazakus Potion",
                        text: card2.description + "\n" + card3.description,
                        cardClass: "NEUTRAL",
                        collectible: false,
                        cost: potionCost,
                        set: "GANGS",
                        type: type
                    }, this.getArtDataForCardID(id, type));
                    
                    this.cache.cardResultInfoHTML.html("<h2>" + card1.name + "<br />+<br />" + card2.name + "<br />+<br />" + card3.name + "</h2>");
                    
                    this.cache.cardResultHTML.empty();
                    this.cache.cardResultHTML.append(potion.createHTML());
                    
                    this.cache.buildACardAnotherHTML.off("click");
                    this.cache.buildACardAnotherHTML.on("click", () =>
                    {
                        this.gotoKazakusPotion();
                    });
                    
                    this.cache.buildACardDownloadHTML.off("click");
                    this.cache.buildACardDownloadHTML.on("click", () =>
                    {
                        this.downloadCanvas(potion.html[0], "Kazakus_Potion-" + card1.id + "-" + card2.id + "-" + card3.id + ".png");
                    });
                    
                    this.cache.buildACardBacktHTML.off("click");
                    this.cache.buildACardBacktHTML.on("click", () =>
                    {
                        this.setHash("");
                        this.gotoMainPage();
                    });
                    
                    potion.html[0].scrollIntoView();
                });
            });
        });
    }
    
    gotoCraftASpiritPage()
    {
        window.scrollTo(0, 0);
        
        this.setHash("nazar");
        
        //Minions with a trigger ("Whenever ...", "After ...", "At the start of your turn ..." and "At the end of your turn ...")
        if(typeof this.pools.nazar1 === "undefined")
        {
            this.pools.nazar1 = this.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "WARLOCK")
                {
                    return false;
                }
                
                if(cardData.cost > 5)
                {
                    return false;
                }
                
                if(typeof cardData.text === "undefined")
                {
                    return false;
                }
                
                if(cardData.text.indexOf("Whenever ") === -1 && cardData.text.indexOf("After ") === -1 && cardData.text.indexOf("At the start of your turn") === -1 && cardData.text.indexOf("At the end of your turn") === -1)
                {
                    return false;
                }
                
                if(cardData.text.indexOf(",") === -1)
                {
                    return false;
                }
                
                return true;
            });
        }
        
        //Minions with deathrattle
        if(typeof this.pools.nazar2 === "undefined")
        {
            const blacklist = {
                ["FP1_014"]: true,
                ["FP1_015"]: true,
                ["GIL_614"]: true,
                ["LOOT_161"]: true,
                ["ICC_025"]: true,
                ["AT_019"]: true
            }
            
            this.pools.nazar2 = this.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(blacklist[cardData.id])
                {
                    return false;
                }
                
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "WARLOCK")
                {
                    return false;
                }
                
                if(cardData.cost > 5)
                {
                    return false;
                }
                
                if(typeof cardData.mechanics === "undefined")
                {
                    return false;
                }
                
                if(!cardData.mechanics.includes("DEATHRATTLE"))
                {
                    return false;
                }
                
                return true;
            });
        }
        
        const pool1 = this.pools.nazar1.slice();
        const pool2 = this.pools.nazar2.slice();
        
        this.setPageInfo("Nazar, the Necromancer", "Choose a trigger card:");
        this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool1)), (card1) =>
        {
            this.setPageInfo("Nazar, the Necromancer", "Choose a deathrattle card to replace the trigger effect:");
            this.setupCardChoice(this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), this.createCardFromJSONData(this.getRandomElementAndRemove(pool2)), (card2) =>
            {
                this.setPageState("page-state-result");
                this.setPageInfo("Nazar, the Necromancer", "Result:");
                
                let mechanics = this.getUniqueArray(card1.mechanics.concat(card2.mechanics));
                let displayedMechanics = []
                let spellDamage = card1.getSpellDamage() + card2.getSpellDamage();
                let description = "";
                
                for(let [mechanicIndex, mechanic] of mechanics.entries())
                {
                    if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY")
                    {
                        displayedMechanics.push(mechanic);
                    }
                }
                
                for(let [mechanicIndex, mechanic] of displayedMechanics.entries())
                {
                    description += "<b>" + this.getMechanicName(mechanic) + (mechanicIndex === displayedMechanics.length - 1 ? "</b>\n" : "</b>, ");
                }
                
                if(spellDamage > 0)
                {
                    const spellDamageText = "<b>Spell Damage +" + spellDamage + "</b>\n";
                    
                    if(description.indexOf("\n") === -1)
                    {
                        description += spellDamageText;
                    }
                    else
                    {
                        description.replace(new RegExp("\n", "g"), ", " + spellDamageText);
                    }
                }
                
                let triggerType
                
                if(card1.description.indexOf("At the start of your turn") !== -1)
                {
                    triggerType = "At the start of your turn";
                }
                else if(card1.description.indexOf("At the end of your turn") !== -1)
                {
                    triggerType = "At the end of your turn";
                }
                else if(card1.description.indexOf("After ") !== -1)
                {
                    triggerType = "After ";
                }
                else
                {
                    triggerType = "Whenever ";
                }
                
                description += card1.description.substring(card1.description.indexOf(triggerType), card1.description.indexOf(","));
                description += ", ";
                description += this.firstIndexToLowerCase(card2.description.substr(card2.description.indexOf("Deathrattle:") + 17)).replace(new RegExp("\n", "g"), " ").trim();
                description = this.fixCardDescription(description);
                
                const spirit = new Card(this, {
                    id: "UNKNOWN",
                    name: "Spirit",
                    text: description,
                    attack: card1.attack + card2.attack,
                    cardClass: card1.cardClass,
                    collectible: false,
                    cost: card1.cost + card2.cost,
                    elite: card1.isElite,
                    health: card1.health + card2.health,
                    mechanics: mechanics,
                    rarity: card1.rarity,
                    set: card1.set,
                    race: card1.race,
                    type: "MINION"
                }, card1.artData);
                
                this.cache.cardResultInfoHTML.html("<h2>" + card1.name + "<br />+<br />" + card2.name + "</h2>");
                
                this.cache.cardResultHTML.empty();
                this.cache.cardResultHTML.append(spirit.createHTML());
                
                this.cache.buildACardAnotherHTML.off("click");
                this.cache.buildACardAnotherHTML.on("click", () =>
                {
                    this.gotoCraftASpiritPage();
                });
                
                this.cache.buildACardDownloadHTML.off("click");
                this.cache.buildACardDownloadHTML.on("click", () =>
                {
                    this.downloadCanvas(spirit.html[0], "Spirit-" + card1.id + "-" + card2.id + ".png");
                });
                
                this.cache.buildACardBacktHTML.off("click");
                this.cache.buildACardBacktHTML.on("click", () =>
                {
                    this.setHash("");
                    this.gotoMainPage();
                });
                
                spirit.html[0].scrollIntoView();
            });
        });
    }
    
    setupCardChoice(card1, card2, card3, onCardChosen)
    {
        window.scrollTo(0, 0);
        
        this.setPageState("page-state-choose");
        
        this.cache.cardChoice1HTML.empty();
        this.cache.cardChoice1HTML.append(card1.createHTML());
        this.cache.cardChoice1HTML.off("click");
        this.cache.cardChoice1HTML.on("click", () =>
        {
            onCardChosen(card1);
        });
        
        this.cache.cardChoice2HTML.empty();
        this.cache.cardChoice2HTML.append(card2.createHTML());
        this.cache.cardChoice2HTML.off("click");
        this.cache.cardChoice2HTML.on("click", () =>
        {
            onCardChosen(card2);
        });

        this.cache.cardChoice3HTML.empty();
        this.cache.cardChoice3HTML.append(card3.createHTML());
        this.cache.cardChoice3HTML.off("click");
        this.cache.cardChoice3HTML.on("click", () =>
        {
            onCardChosen(card3);
        });
    }
    
    setHash(hash)
    {
        if(hash === "")
        {
            history.replaceState("", document.title, location.pathname + location.search);
        }
        else
        {
            history.replaceState("", document.title, location.pathname + location.search + "#" + hash);
        }
    }
    
    downloadCanvas(canvas, fileName)
    {
        /// create an "off-screen" anchor tag
        var lnk = document.createElement('a'), e;
        
        /// the key here is to set the download attribute of the a tag
        lnk.download = fileName;
        
        /// convert canvas content to data-uri for link. When download
        /// attribute is set the content pointed to by link will be
        /// pushed as "download" in HTML5 capable browsers
        lnk.href = canvas.toDataURL("image/png;base64");
        
        /// create a "fake" click-event to trigger the download
        if(document.createEvent)
        {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            
            lnk.dispatchEvent(e);
        }
        else if(lnk.fireEvent)
        {
            lnk.fireEvent("onclick");
        }
    }
    
    fixCardDescription(description)
    {
        description = description.replace(new RegExp("\\[x\\]", "g"), "");
        description = description.replace(new RegExp("\\[X\\]", "g"), "");
        //Reduce spaces to one space
        description = description.replace(/  +/g, ' ');
        description = description.replace(new RegExp("\n\n", "g"), "\n");
        description = description.replace(new RegExp("\n \n", "g"), "\n");
        description = description.trim();
        
        return description;
    }
    
    getUniqueArray(arr)
    {
        var a = [];
        
        for(let i = 0; i < arr.length; i++)
        {
            var current = arr[i];
            
            if(a.indexOf(current) < 0)
            {
                a.push(current);
            }
        }
        
        return a;
    }
    
    toTitleCase(str)
    {
        return str.toLowerCase().replace(/\b\S/g, function(t)
        {
            return t.toUpperCase()
        });
    }
    
    firstIndexToLowerCase(str)
    {
        return str[0].toLowerCase() + str.substr(1);
    }
    
    getMechanicName(mechanicEnum)
    {
        let mechanic = mechanicEnum
        mechanic = mechanic.replace(new RegExp("_", "g"), " ");
        mechanic = this.toTitleCase(mechanic);
        
        return mechanic;
    }
    
    getArtDataForCardID(cardID, cardType)
    {
        let artData = {
            texture: "images/art/" + cardID + ".jpg",
            x: 0,
            y: 0,
            width: 256,
            height: 382
        };
        
        switch(cardType)
        {
            case "MINION":
                artData = {
                    texture: "images/art/" + cardID + ".jpg",
                    x: -62,
                    y: -86,
                    width: 380,
                    height: 830
                };
                
                break;
                
            case "SPELL":
                artData = {
                    texture: "images/art/" + cardID + ".jpg",
                    x: -70,
                    y: -112,
                    width: 400,
                    height: 880
                };
                
                break;
        }
        
        return artData;
    }
    
    createCardFromJSONData(cardData)
    {
        return new Card(this, cardData, this.getArtDataForCardID(cardData.id, cardData.type));
    }
    
    loadCardJSON()
    {
        $.getJSON("json/cards.json", (cardsData) =>
        {
            this.setupCardPools(cardsData);
            this.gotoMainPage();
        });
    }
    
    setupCardPools(cardsData)
    {
        this.pools.allCards = cardsData;
        this.pools.allCollectibleCards = this.pools.allCards.filter(cardData => cardData.collectible === true);
        this.pools.allMinions = this.pools.allCards.filter(cardData => cardData.type === "MINION");
        this.pools.allCollectibleMinions = this.pools.allMinions.filter(cardData => cardData.collectible === true);
    }
    
    setupMainPage()
    {
        $("#nazar img, #nazar button").on("click", () =>
        {
            this.gotoCraftASpiritPage();
        });
        
        $("#build-a-beast img, #build-a-beast button").on("click", () =>
        {
            this.gotoBuildABeastPage();
        });
        
        $("#kazakus img, #kazakus button").on("click", () =>
        {
            this.gotoKazakusPotion();
        });
        
        $(window).on("hashchange", (event) =>
        {
            switch(location.hash)
            {
                case "":
                    this.gotoMainPage();
                    
                    break;
                
                case "#nazar":
                    this.gotoCraftASpiritPage();
                
                    break;
                
                case "#build-a-beast":
                    this.gotoBuildABeastPage();
                
                    break;
                    
                case "#kazakus":
                    this.gotoKazakusPotion();
                
                    break;
            }
        });
    }
    
    getImageCached(src, onLoad)
    {
        if(typeof this.imageCache[src] === "undefined")
        {
            this.imageCache[src] = $(`<img src="` + src + `" />`);
            this.imageCache[src].on("load", () =>
            {
                onLoad(this.imageCache[src]);
            });
            
            $("#img-cache").append(this.imageCache[src]);
        }
        else
        {
            onLoad(this.imageCache[src]);
        }
    }
}

$(window).on("load", () =>
{
    const fontOPTIBelweMedium = new FontFaceObserver("OPTIBelweMedium");
    
    fontOPTIBelweMedium.load().then(() =>
    {
        const sunwell = new Sunwell({
            assetFolder: "images/sunwell/",
            titleFont: "OPTIBelweMedium",
            bodyFontRegular: "franklin_gothic_fsMdCn",
            bodyFontItalic: "franklin_gothic_fsMdCnIt",
            bodyFontBold: "franklin_gothic_fsDemiCn",
            bodyFontBoldItalic: "franklin_gothic_fsDemiCn",
            bodyFontSize: 32,
            bodyLineHeight: 40,
            bodyFontOffset: {x: 0, y: 26}
        });
        
        new BuildACardApp(sunwell);
    });
});
