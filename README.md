Registr smluv
==============

Specifikace
---------------------------------

Registr smluv je úložiště, ve kterém má veřejnost možnost seznámit se se všemi uzavřenými smlouvami. 

Základní pohledy:
* seznam smluv s možností filtrace, řazení a exportu smluv (.odt, .xls apod.) podle jejích metadat
* jednotlivá stránka s údaji o té které konkrétní smlouvě a smlouvách s ní souvisejících, včetně standardizovaného odkazu na strojově čitelný text smlouvy a s možností linkovat stránku se smlouvou
* API umožňující přístup k datům pomocí standardizovaných nástrojů (viz gapi)

Uchovávaná metadata: 
* smluvní strana, datum jejího podpisu a jednoznačný identifikátor smlouvy v rámci smluvní strany (musí být subjekt!) 
* datum účinnosti smlouvy 
* použitý smluvní vzor
* smluvní typ
* odkaz na související výběrové řízení
* předmět hlavního plnění
* peněžité ocenění předmětu plnění
* příslušná organizační složka smluvní strany (členění klidně vícekrát) - odpovědná osoba v organizační složce (jednající a odsouhlasivší smlouvu podle vnitřních procesů) - případně s odkazem na gapi
* datum splnění předmětu smlouvy
* stav (splněna, zrušena, vypovězena, odstoupení apod.)

Důležitá je škálovatelnost, aby fungovalo i při vysokém zatížení. Cachuje se ve statickém html poslední uzavřené smlouvy, nejdražší záměry v posledním roce apod., ze kterých lze js udělat selekci podobně jako v internetových obchodech (rozmezí cen apod.).


Pokyny k instalaci
------------------

1. Pro správu webu a zobrazování na vlastním počítači je třeba mít nainstalovaný ``jekyll`` podle [návodu](http://jekyllrb.com/docs/installation/).

2. Web stáhnete příkazem ``git clone https://github.com/pirati-cz/smlouvy.git``.

3. Základní vlastnosti můžete nastavit v konfiguraci webu v souboru ``_config``

4. Všechny informace o smlouvě (textový dokument a jeho přílohy) jsou uloženy v jedné složce. Tato složka se vkládá do adresáře ``_posts``. V postech můžete používat i tučné písmo nebo jiné formátování v [syntaxi markdown](http://www.edgering.org/markdown/).

5. Miniatury se generují příkazem ``skripty/generate_thumbnails.sh``, který je třeba spustit. 

6. Pro přípravu webu jako celku na vlastním počítači použijte příkaz ``jekyll serve --watch``. Ten vytvoří instanci pro testování v prohlížeči (Firefox, Chromium apod.) na adrese ``localhost:4000``. Uložené změny v souborech se projeví po obnovení stránky i v prohlížeči. Stránku můžete v prohlížeči obnovit klávesou ``F5``.

7. Výsledky uložte v gitu (``git add _/posts/2014-09-12-smlouva-o-dilo/``, ``git commit -m "Smlouva o dílo"``) a nahrajte do repozitáře (``git push``). Pokud nemáte oprávnění nahrávat na repozitář, připravte [pull request](https://help.github.com/articles/creating-a-pull-request).

8. Na Internetu se díky funkci [github pages](https://pages.github.com/) zobrazuje web, jak je vytvořený ve větvi ``gh-pages``. 

Tento web je svobodný software za podmínek [licence GNU AGPL v3](LICENSE), není-li na něm uvedeno jinak.
