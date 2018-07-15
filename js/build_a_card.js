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
                    "race": this.race,
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

class CardBuilder
{
    constructor(buildACardApp)
    {
        if(new.target === CardBuilder)
        {
            throw new TypeError("Cannot construct CardBuilder instances directly");
        }
        
        this.buildACardApp = buildACardApp;
        this.pools = {};
        this.hash = "";
        this.title = "";
        this.description = "";
        this.downloadPrefix = "";
    }
    
    start()
    {
        window.scrollTo(0, 0);
        
        this.buildACardApp.setHash(this.hash);
        
        this.loadPools();
    }
    
    addPool(key, cards)
    {
        this.pools[key] = cards;
    }
    
    getPool(key)
    {
        return this.pools[key];
    }
    
    loadPools()
    {
        
    }
    
    createResultCard(cards)
    {
        return null;
    }
    
    showResultCard(cards)
    {
        const resultCard = this.createResultCard(cards);
        
        let resultInfo = "<h2>";
        let downloadName = this.downloadPrefix + "-";
        
        for(let [cardIndex, card] of cards.entries())
        {
            if(cardIndex !== cards.length - 1)
            {
                resultInfo += card.name + "<br />+<br />";
                downloadName += card.id + "-";
            }
            else
            {
                resultInfo += card.name + "</h2>";
                downloadName += card.id + ".png";
            }
        }
        
        this.buildACardApp.cache.cardResultInfoHTML.html(resultInfo);
        
        this.buildACardApp.cache.cardResultHTML.empty();
        this.buildACardApp.cache.cardResultHTML.append(resultCard.createHTML());
        
        this.buildACardApp.cache.buildACardAnotherHTML.off("click");
        this.buildACardApp.cache.buildACardAnotherHTML.on("click", (event) =>
        {
            this.start();
        });
        
        this.buildACardApp.cache.buildACardDownloadHTML.off("click");
        this.buildACardApp.cache.buildACardDownloadHTML.on("click", (event) =>
        {
            this.buildACardApp.downloadCanvas(resultCard.canvasHTML[0], downloadName);
        });
        
        this.buildACardApp.cache.buildACardBacktHTML.off("click");
        this.buildACardApp.cache.buildACardBacktHTML.on("click", (event) =>
        {
            this.buildACardApp.setHash("");
            this.buildACardApp.gotoMainPage();
        });
        
        resultCard.html[0].scrollIntoView();
    }
}

class BuildAMechCardBuilder extends CardBuilder
{
    constructor(buildACardApp)
    {
        super(buildACardApp)
        
        this.hash = "boom-labs-factory";
        this.title = "Boom Labs Factory";
        this.description = `Custom Mechs are crafted using the same rules as Zombeasts, except with Mechs instead of Beasts.<br />They also have a third choice, which is special Spare Parts to modify them.<br />Boom Bots are also included in the first choice, it's Boom Labs after all.`;
        this.imageSrc = "images/factory.png";
        this.downloadPrefix = "Mech";
    }
    
    start()
    {
        super.start();
        
        this.buildACardApp.setPageInfo(this.title, "Choose a Mech with text:");
        this.buildACardApp.setupRandomCardChoice(this.getPool("text"), true, (textCard) =>
        {
            this.buildACardApp.setPageInfo(this.title, "Choose a Mech with only keywords or no text:");
            this.buildACardApp.setupRandomCardChoice(this.getPool("keywords"), true, (keywordsCard) =>
            {
                this.buildACardApp.setPageInfo(this.title, "Choose a Spare Part:");
                this.buildACardApp.setupRandomCardChoice(this.getPool("sparePart"), true, (sparePartCard) =>
                {
                    this.buildACardApp.setPageState("page-state-result");
                    this.buildACardApp.setPageInfo(this.title, "Result:");
                    
                    this.showResultCard([
                        textCard,
                        keywordsCard,
                        sparePartCard
                    ]);
                });
            });
        });
    }
    
    createResultCard(cards)
    {
        const textCard = cards[0];
        const keywordsCard = cards[1];
        const sparePartCard = cards[2];
        
        let mechanics = this.buildACardApp.getUniqueArray(textCard.mechanics.concat(keywordsCard.mechanics));
        let displayedMechanics = []
        let spellDamage = textCard.getSpellDamage() + keywordsCard.getSpellDamage();
        let description = "";
        let attack = textCard.attack + keywordsCard.attack;
        let health = textCard.health + keywordsCard.health
        
        switch(sparePartCard.id)
        {
            case "BACS_DRBOOM_SPAREPART_HEALTH":
                health += 1;
                
                break;
            
            case "BACS_DRBOOM_SPAREPART_STEALTH":
                if(mechanics.indexOf("STEALTH") === -1) 
                {
                    mechanics.push("STEALTH");
                }   
                
                break;
            
            case "BACS_DRBOOM_SPAREPART_SWAP":
                [attack, health] = [health, attack];
                
                break;
            
            case "BACS_DRBOOM_SPAREPART_TAUNT":
                if(mechanics.indexOf("TAUNT") === -1) 
                {
                    mechanics.push("TAUNT");
                }
                
                break;
            
            case "BACS_DRBOOM_SPAREPART_ATTACK":
                attack += 1;
                
                break;
            
            case "BACS_DRBOOM_SPAREPART_MAGNETIC":
                if(mechanics.indexOf("MAGNETIC") === -1) 
                {
                    mechanics.push("MAGNETIC");
                }
            
                break;
        }
        
        let tempDescription = textCard.description;
        tempDescription = textCard.description.replace(new RegExp("\n", "g"), " ");
        
        for(let [mechanicIndex, mechanic] of textCard.mechanics.entries())
        {
            if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY" || mechanic === "MAGNETIC")
            {
                tempDescription = tempDescription.replace(new RegExp(this.buildACardApp.getMechanicName(mechanic), ""), "");
            }
        }
        
        for(let [mechanicIndex, mechanic] of mechanics.entries())
        {
            if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY" || mechanic === "MAGNETIC")
            {
                displayedMechanics.push(mechanic);
            }
        }
        
        for(let [mechanicIndex, mechanic] of displayedMechanics.entries())
        {
            description += "<b>" + this.buildACardApp.getMechanicName(mechanic) + (mechanicIndex === displayedMechanics.length - 1 ? "</b>" + (displayedMechanics.length <= 2 ? "\n" : ". ") : "</b>, ");
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
        
        description += tempDescription;
        description = this.buildACardApp.fixCardDescription(description);
        
        const mechCard = new Card(this.buildACardApp, {
            id: "BACS_MECH",
            name: "Fused Mech",
            text: description,
            attack: attack,
            cardClass: textCard.cardClass,
            collectible: false,
            cost: textCard.cost + keywordsCard.cost,
            elite: textCard.isElite,
            health: health,
            mechanics: mechanics,
            rarity: textCard.rarity,
            set: textCard.set,
            race: "MECHANICAL",
            type: "MINION"
        }, textCard.artData);
        
        return mechCard;
    }
    
    loadPools()
    {
        super.loadPools();
        
        if(!this.isPoolsLoaded)
        {
            //Mechs with only card text
            const keywordsPool = this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "WARRIOR")
                {
                    return false;
                }
                
                if(cardData.race !== "MECHANICAL" && cardData.race !== "ALL")
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
                
                let description = typeof cardData.text === "undefined" ? "" : cardData.text;
                
                if(typeof cardData.mechanics !== "undefined")
                {
                    for(let [mechanicIndex, mechanic] of cardData.mechanics.entries())
                    {
                        description = description.replace(new RegExp(mechanic.replace(new RegExp("_", "g"), " "), "ig"), "");
                    }
                }
                
                //Remove everything a card with only keyworlds will have
                
                description = description.replace(new RegExp("<b>", "g"), "");
                description = description.replace(new RegExp("</b>", "g"), "");
                description = description.replace(new RegExp("\\.", "g"), "");
                description = description.replace(new RegExp("\\,", "g"), "");
                description = description.replace(new RegExp(" ", "g"), "");
                description = description.replace(new RegExp("\n", "g"), "");
                
                //If the description no longer have text
                if(description.length === 0)
                {
                    return false;
                }
                
                
                return true;
            });
            
            //Extra mechs
            keywordsPool.push(this.buildACardApp.pools.allMinions.filter(cardData => cardData.id === "GVG_110t")[0]);
            
            this.addPool("text", keywordsPool);
            
            
            //Mechs that are blank or only has keywords
            this.addPool("keywords", this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
            {
                if(cardData.cardClass !== "NEUTRAL" && cardData.cardClass !== "WARRIOR")
                {
                    return false;
                }
                
                if(cardData.race !== "MECHANICAL" && cardData.race !== "ALL")
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
                        
                        if(mechanic !== "CHARGE" && mechanic !== "DIVINE_SHIELD" && mechanic !== "ECHO" && mechanic !== "LIFESTEAL" && mechanic !== "POISONOUS" && mechanic !== "RUSH" && mechanic !== "STEALTH" && mechanic !== "TAUNT" && mechanic !== "WINDFURY" && mechanic !== "MAGNETIC")
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
            }));
            
            //Spare Parts to modify the custom Mech
            this.addPool("sparePart", [
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_HEALTH",
                        name: "Armor Plating",
                        text: "Gain +1 Health.",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    this.buildACardApp.getArtDataForCardID("PART_001", "SPELL")
                ),
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_STEALTH",
                        name: "Finicky Cloakfield",
                        text: "Gain <b>Stealth.</b>",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    this.buildACardApp.getArtDataForCardID("PART_004", "SPELL")
                ),
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_SWAP",
                        name: "Reversing Switch",
                        text: "Swap Attack and Health.",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    this.buildACardApp.getArtDataForCardID("PART_006", "SPELL")
                ),
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_TAUNT",
                        name: "Rusty Horn",
                        text: "Gain <b>Taunt.</b>",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    this.buildACardApp.getArtDataForCardID("PART_003", "SPELL")
                ),
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_ATTACK",
                        name: "Whirling Blades",
                        text: "Gain +1 Attack.",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    this.buildACardApp.getArtDataForCardID("PART_007", "SPELL")
                ),
                new Card(
                    this.buildACardApp,
                    {
                        id: "BACS_DRBOOM_SPAREPART_MAGNETIC",
                        name: "Magnetizer",
                        text: "Gain <b>Magnetic.</b>",
                        cardClass: "WARRIOR",
                        collectible: false,
                        cost: 0,
                        type: "SPELL"
                    },
                    {
                        texture: "images/art_extra/magnetizer.jpg",
                        x: 0,
                        y: -70,
                        width: 256,
                        height: 482
                    }
                )
            ]);
            
            this.isPoolsLoaded = true;
        }
    }
}

class SpiritCardBuilder extends CardBuilder
{
    constructor(buildACardApp)
    {
        super(buildACardApp)
        
        this.hash = "necromancer";
        this.title = "Experimenting Necromancer";
        this.description = `
            Custom Spirits is a combination of a trigger card and a Deathrattle card.
            <br />
            <br />
            The first choice is a trigger card (any card with "Whenever", "After", "Start of turn" or "End of turn").
            <br />
            <br />
            The second choice is a card with a Deathrattle to replace the trigger effect.
            <br />
            <br />
            Both choices cost 5 or less.
            <br />
            Cost, Attack, Health and Keywords will be combined.
        `;
        this.imageSrc = "images/necromancer.png";
        this.downloadPrefix = "Spirit";
    }
    
    start()
    {
        super.start();
        
        this.buildACardApp.setPageInfo("Craft a Spirit", "Choose a trigger card:");
        this.buildACardApp.setupRandomCardChoice(this.getPool("trigger"), true, (triggerCard) =>
        {
            this.buildACardApp.setPageInfo("Craft a Spirit", "Choose a deathrattle card to replace the trigger effect:");
            this.buildACardApp.setupRandomCardChoice(this.getPool("deathrattle"), true, (deathrattleCard) =>
            {
                this.buildACardApp.setPageState("page-state-result");
                this.buildACardApp.setPageInfo("Craft a Spirit", "Result:");
                
                this.showResultCard([
                    triggerCard,
                    deathrattleCard
                ]);
            });
        });
    }
    
    createResultCard(cards)
    {
        const triggerCard = cards[0];
        const deathrattleCard = cards[1];
        
        let mechanics = this.buildACardApp.getUniqueArray(triggerCard.mechanics.concat(deathrattleCard.mechanics));
        let displayedMechanics = []
        let spellDamage = triggerCard.getSpellDamage() + deathrattleCard.getSpellDamage();
        let description = "";
        
        for(let [mechanicIndex, mechanic] of mechanics.entries())
        {
            if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY" || mechanic === "MAGNETIC")
            {
                displayedMechanics.push(mechanic);
            }
        }
        
        for(let [mechanicIndex, mechanic] of displayedMechanics.entries())
        {
            description += "<b>" + this.buildACardApp.getMechanicName(mechanic) + (mechanicIndex === displayedMechanics.length - 1 ? "</b>\n" : "</b>, ");
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
        
        if(triggerCard.description.indexOf("At the start of your turn") !== -1)
        {
            triggerType = "At the start of your turn";
        }
        else if(triggerCard.description.indexOf("At the end of your turn") !== -1)
        {
            triggerType = "At the end of your turn";
        }
        else if(triggerCard.description.indexOf("After ") !== -1)
        {
            triggerType = "After ";
        }
        else
        {
            triggerType = "Whenever ";
        }
        
        description += triggerCard.description.substring(triggerCard.description.indexOf(triggerType), triggerCard.description.indexOf(","));
        description += ", ";
        description += this.buildACardApp.firstIndexToLowerCase(deathrattleCard.description.substr(deathrattleCard.description.indexOf("Deathrattle:") + 17)).replace(new RegExp("\n", "g"), " ").trim();
        description = this.buildACardApp.fixCardDescription(description);
        
        const spiritCard = new Card(this.buildACardApp, {
            id: "BACS_SPIRIT",
            name: "Spirit",
            text: description,
            attack: triggerCard.attack + deathrattleCard.attack,
            cardClass: triggerCard.cardClass,
            collectible: false,
            cost: triggerCard.cost + deathrattleCard.cost,
            elite: triggerCard.isElite,
            health: triggerCard.health + deathrattleCard.health,
            mechanics: mechanics,
            rarity: triggerCard.rarity,
            set: triggerCard.set,
            race: triggerCard.race,
            type: "MINION"
        }, triggerCard.artData);
        
        return spiritCard;
    }
    
    loadPools()
    {
        super.loadPools();
        
        if(!this.isPoolsLoaded)
        {
            const blacklist = {
                ["FP1_014"]: true,
                ["FP1_015"]: true,
                ["GIL_614"]: true,
                ["LOOT_161"]: true,
                ["ICC_025"]: true,
                ["AT_019"]: true,
                ["ICC_019"]: true,
                ["ICC_067"]: true,
                ["CFM_637"]: true
            }
            
            //Minions with a trigger ("Whenever ...", "After ...", "At the start of your turn ..." and "At the end of your turn ...")
            this.addPool("trigger", this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
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
            }));
            
            //Minions with deathrattle
            this.addPool("deathrattle", this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
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
            }));
            
            this.isPoolsLoaded = true;
        }
    }
}

class BuildABeastCardBuilder extends CardBuilder
{
    constructor(buildACardApp)
    {
        super(buildACardApp)
        
        this.hash = "deathstalker-rexxar";
        this.title = "Deathstalker Rexxar";
        this.description = `Hero card from the game.`;
        this.imageSrc = "images/deathstalker_rexxar.png";
        this.downloadPrefix = "Zombeast";
    }
    
    start()
    {
        super.start();
        
        this.buildACardApp.setPageInfo("Deathstalker Rexxar", "Choose a Beast with text:");
        this.buildACardApp.setupRandomCardChoice(this.getPool("text"), true, (textCard) =>
        {
            
            this.buildACardApp.setPageInfo("Deathstalker Rexxar", "Choose a Beast with only keywords or no text:");
            this.buildACardApp.setupRandomCardChoice(this.getPool("keywords"), true, (keywordsCard) =>
            {
                this.buildACardApp.setPageState("page-state-result");
                this.buildACardApp.setPageInfo("Deathstalker Rexxar", "Result:");
                
                this.showResultCard([
                    textCard,
                    keywordsCard
                ]);
            });
        });
    }
    
    createResultCard(cards)
    {
        const textCard = cards[0];
        const keywordsCard = cards[1];
        
        let mechanics = this.buildACardApp.getUniqueArray(textCard.mechanics.concat(keywordsCard.mechanics));
        let displayedMechanics = []
        let spellDamage = textCard.getSpellDamage() + keywordsCard.getSpellDamage();
        let description = "";
        
        for(let [mechanicIndex, mechanic] of mechanics.entries())
        {
            if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY" || mechanic === "MAGNETIC")
            {
                displayedMechanics.push(mechanic);
            }
        }
        
        for(let [mechanicIndex, mechanic] of displayedMechanics.entries())
        {
            description += "<b>" + this.buildACardApp.getMechanicName(mechanic) + (mechanicIndex === displayedMechanics.length - 1 ? "</b>\n" : "</b>, ");
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
        
        description += textCard.description.replace(new RegExp("\n", "g"), " ");
        description = this.buildACardApp.fixCardDescription(description);
        
        const zombeastCard = new Card(this.buildACardApp, {
            id: "ICC_800h3t",
            name: "Zombeast",
            text: description,
            attack: textCard.attack + keywordsCard.attack,
            cardClass: textCard.cardClass,
            collectible: false,
            cost: textCard.cost + keywordsCard.cost,
            elite: textCard.isElite,
            health: textCard.health + keywordsCard.health,
            mechanics: mechanics,
            rarity: textCard.rarity,
            set: textCard.set,
            race: "BEAST",
            type: "MINION"
        }, textCard.artData);
        
        return zombeastCard;
    }
    
    loadPools()
    {
        super.loadPools();
        
        if(!this.isPoolsLoaded)
        {
            //Beasts with only card text
            this.addPool("text", this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
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
                
                if(typeof cardData.text === "undefined")
                {
                    return false;
                }
                
                if(typeof cardData.mechanics !== "undefined")
                {
                    for(let [mechanicIndex, mechanic] of cardData.mechanics.entries())
                    {
                        if(mechanic === "CHARGE" || mechanic === "DIVINE_SHIELD" || mechanic === "ECHO" || mechanic === "LIFESTEAL" || mechanic === "POISONOUS" || mechanic === "RUSH" || mechanic === "STEALTH" || mechanic === "TAUNT" || mechanic === "WINDFURY" || mechanic === "MAGNETIC")
                        {
                            return false;
                        }
                    }
                }
                
                return true;
            }));
            
            //Beasts that are blank or only has keywords
            this.addPool("keywords", this.buildACardApp.pools.allCollectibleMinions.filter((cardData) =>
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
                        
                        if(mechanic !== "CHARGE" && mechanic !== "DIVINE_SHIELD" && mechanic !== "ECHO" && mechanic !== "LIFESTEAL" && mechanic !== "POISONOUS" && mechanic !== "RUSH" && mechanic !== "STEALTH" && mechanic !== "TAUNT" && mechanic !== "WINDFURY" && mechanic !== "MAGNETIC")
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
            }));
            
            this.isPoolsLoaded = true;
        }
    }
}

class KazakusPotionCardBuilder extends CardBuilder
{
    constructor(buildACardApp)
    {
        super(buildACardApp)
        
        this.isPoolsLoaded = false;
        
        this.hash = "kazakus";
        this.title = "Kazakus";
        this.description = `Legendary minion from the game.`;
        this.imageSrc = "images/kazakus.png";
        this.downloadPrefix = "Kazakus_Potion";
    }
    
    start()
    {
        super.start();
        
        const costPool = this.getPool("cost");
        
        this.buildACardApp.setPageInfo("Kazakus Potion", "Choose a cost:");
        this.buildACardApp.setupCardChoice(costPool[0], costPool[1], costPool[2], (costCard) =>
        {
            let effect1Pool;
            
            if(costCard.cost === 1)
            {
                effect1Pool = this.getPool("1mana").slice();
            }
            else if(costCard.cost === 5)
            {
                effect1Pool = this.getPool("5mana").slice();
            }
            else
            {
                effect1Pool = this.getPool("10mana").slice();
            }
            
            this.buildACardApp.setPageInfo("Kazakus Potion", "Choose the first effect:");
            this.buildACardApp.setupRandomCardChoice(effect1Pool, true, (effect1Card) =>
            {
                let effect2Pool = effect1Pool.slice();
                effect2Pool = effect2Pool.filter(cardData => cardData.id !== effect1Card.id);
                
                this.buildACardApp.setPageInfo("Kazakus Potion", "Choose the second effect:");
                this.buildACardApp.setupRandomCardChoice(effect2Pool, true, (effect2Card) =>
                {
                    this.buildACardApp.setPageState("page-state-result");
                    this.buildACardApp.setPageInfo("Kazakus Potion", "Result:");
                    
                    this.showResultCard([
                        costCard,
                        effect1Card,
                        effect2Card
                    ]);
                });
            });
        });
    }
    
    createResultCard(cards)
    {
        const costCard = cards[0];
        const effect1Card = cards[1];
        const effect2Card = cards[2];
        
        let id;
        
        if(costCard.cost === 1)
        {
            id = "CFM_621t";
        }
        else if(costCard.cost === 5)
        {
            id = "CFM_621t14";
        }
        else
        {
            id = "CFM_621t15";
        }
        
        const potionCard = new Card(this.buildACardApp, {
            id: id,
            name: "Kazakus Potion",
            text: effect1Card.description + "\n" + effect2Card.description,
            cardClass: "NEUTRAL",
            collectible: false,
            cost: costCard.cost,
            set: "GANGS",
            type: "SPELL"
        }, this.buildACardApp.getArtDataForCardID(id, "SPELL"));
        
        return potionCard;
    }
    
    loadPools()
    {
        super.loadPools();
        
        if(!this.isPoolsLoaded)
        {
            //Potions costs
            this.addPool("cost", this.buildACardApp.pools.allCards.filter((cardData) =>
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
            }));
            
            //1 mana effects
            this.addPool("1mana", this.buildACardApp.pools.allCards.filter((cardData) =>
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
            }));
            
            //5 mana effects
            this.addPool("5mana", this.buildACardApp.pools.allCards.filter((cardData) =>
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
            }));
            
            //10 mana effects
            this.addPool("10mana", this.buildACardApp.pools.allCards.filter((cardData) =>
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
            }));
            
            this.isPoolsLoaded = true;
        }
    }
}

class BuildACardApp
{
    constructor(sunwell, cardBuilders)
    {
        this.cache = {};
        this.pools = {};
        this.imageCache = {};
        this.sunwell = sunwell;
        this.cardBuilders = [
            new BuildAMechCardBuilder(this),
            new SpiritCardBuilder(this),
            new BuildABeastCardBuilder(this),
            new KazakusPotionCardBuilder(this)
        ];
        
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
        this.cache.cardBuildersHTML = $("#card-builders");
        this.cache.pageStateChooseHTML = $("#page-state-choose");
        this.cache.cardChoice1HTML = $("#card-choice-1");
        this.cache.cardChoice2HTML = $("#card-choice-2");
        this.cache.cardChoice3HTML = $("#card-choice-3");
        this.cache.choiceRerollHTML = $("#choice-reroll");
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
    
    setupCardChoice(cardData1, cardData2, cardData3, onCardChosen)
    {
        window.scrollTo(0, 0); 

        this.cache.pageStateChooseHTML.find("hr").css("display", "none");
        this.cache.choiceRerollHTML.parent().css("display", "none");

        this.setPageState("page-state-choose");
        
        const card1 = cardData1 instanceof Card ? cardData1 : this.createCardFromCardData(cardData1);
        const card2 = cardData2 instanceof Card ? cardData2 : this.createCardFromCardData(cardData2);
        const card3 = cardData3 instanceof Card ? cardData3 : this.createCardFromCardData(cardData3);
        
        this.cache.cardChoice1HTML.empty();
        this.cache.cardChoice1HTML.append(card1.createHTML());
        this.cache.cardChoice1HTML.off("click");
        this.cache.cardChoice1HTML.on("click", (event) =>
        {
            onCardChosen(card1);
        });
        
        this.cache.cardChoice2HTML.empty();
        this.cache.cardChoice2HTML.append(card2.createHTML());
        this.cache.cardChoice2HTML.off("click");
        this.cache.cardChoice2HTML.on("click", (event) =>
        {
            onCardChosen(card2);
        });
        
        this.cache.cardChoice3HTML.empty();
        this.cache.cardChoice3HTML.append(card3.createHTML());
        this.cache.cardChoice3HTML.off("click");
        this.cache.cardChoice3HTML.on("click", (event) =>
        {
            onCardChosen(card3);
        });
    }
    
    setupRandomCardChoice(pool, allowReroll, onCardChosen)
    {
        const poolCopy = pool.slice();
        
        this.setupCardChoice(this.getRandomElementAndRemove(poolCopy), this.getRandomElementAndRemove(poolCopy), this.getRandomElementAndRemove(poolCopy), onCardChosen);
        
        if(allowReroll)
        {
            this.cache.pageStateChooseHTML.find("hr").css("display", "");
            this.cache.choiceRerollHTML.parent().css("display", "");
            
            this.cache.choiceRerollHTML.off("click");
            this.cache.choiceRerollHTML.on("click", (event) =>
            {
                this.setupRandomCardChoice(pool, allowReroll, onCardChosen);
            });
        }
        else
        {
            this.cache.pageStateChooseHTML.find("hr").css("display", "none");
            this.cache.choiceRerollHTML.parent().css("display", "none");
        }
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
        description = description.replace(new RegExp("[b][/b]", "g"), "");
        description = description.replace(new RegExp("[b] [/b]", "g"), "");
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
    
    createCardFromCardData(cardData)
    {
        if(typeof cardData.text !== "undefined")
        {
            //cardData.text = cardData.text.replace(new RegExp("\n", "g"), " ");
        }
        
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
        for(let [cardBuilderIndex, cardBuilder] of this.cardBuilders.entries())
        {
            const cardBuilderHTML = $(`
                <div class="col-md-3 bottom-margin">
                    <div class="card border border-secondary">
                        <img class="card-img-top clickable" src="` + cardBuilder.imageSrc + `" alt="Kazakus">
                        <div class="card-body">
                            <h5 class="card-title">` + cardBuilder.title + `</h5>
                            <p class="card-text">
                                ` + cardBuilder.description + `
                            </p>
                            <button class="btn btn-primary btn-block" type="button">Craft</button>
                        </div>
                    </div>
                </div>
            `);
            
            cardBuilderHTML.on("click", (event) =>
            {
                cardBuilder.start();
            });
            
            $(window).on("hashchange", (event) =>
            {
                if(location.hash === "#" + cardBuilder.hash)
                {
                    cardBuilder.start();
                }
            });
            
            this.cache.cardBuildersHTML.append(cardBuilderHTML);
        }
        
        $(window).on("hashchange", (event) =>
        {
            if(location.hash === "")
            {
                this.gotoMainPage();
            }
        });
    }
    
    getImageCached(src, onLoad)
    {
        if(typeof this.imageCache[src] === "undefined")
        {
            this.imageCache[src] = $(`<img src="` + src + `" />`);
            this.imageCache[src].on("load", (event) =>
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

$(window).on("load", (event) =>
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
        
        window.buildACardApp = new BuildACardApp(sunwell);
    });
});
