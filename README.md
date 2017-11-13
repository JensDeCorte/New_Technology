# WebGl - New Technology #
---

## Introductie ##

WebGl wordt gebruikt voor het weergeven van realtime 3D graphics in een compatibele browser. Het is een rasterization engine dat lijnen, punten en driehoeken tekend met de code die je schrijft in JavaScript. WebGl is gebaseerd op OpenGl en wordt uitgevoerd op de GPU van de computer. Het is daarmee ook een redelijk low-level taal.

## The rendering pipeline ##

1.  Het proces begint met het creëren van **vertex arrays**. Deze bevat attributen die de punten beschrijven ( positie, kleur,…).

... Deze arrays worden gecreëerd op de CPU van uw computer en dienen naar de GPU te worden verstuurd. Hier worden ze opgeslagen in **vertex buffers**. Er moet hierbij nog een extra array verstuurd worden die ons verteld waar in de vertex array welke informatie staat.

... Het versturen van informatie van de CPU naar de GPU is een veeleisend proces. Het is dan ook goed om dit zo weinig mogelijk te doen en data in grotere blokken te versturen.

2.  Deze data passeert dan op de GPU door de **vertex shader**. Dit is een zelfgeschreven functie, geschreven in C/C++ die elk attribuut van de punten verwerkt (positie, kleur,...). WebGL biedt ook default vertex shaders aan.

3.  De GPU verbindt deze punten dan en maakt er driehoeken van (de basisvorm van 3D Graphics). Die lopen dan door een **rasterizer**. Deze vult de ruimte tussen de punten van de driehoek op met pixels. Pixels die buiten het zichtveld vallen (canvas) worden vergeten.

4.  De **fragment shader**, ook wel pixel shader, kleurt deze pixels op.

5.  En als laatste worden ze naar de **framebuffer** gestuurd, waar het getoond wordt op het scherm.

Een Vertex shader en een Fragment shader worden samen een program genoemt.

## Sample 1 - WebGl Instantiëren ##
Zie code/sample_1 voor uitleg

## Sample 2 - Een simpele driehoek tekenen ##
Zie code/sample_2 voor uitleg

## Sample 3 - Een 3D kubus ##
Zie code/sample_3 voor uitleg

## Sample 4 - Textures ##
Zie code/sample_4 voor uitleg

## Sample 5 - Externe meshes laden ##
Zie code/sample_5 voor uitleg

## Sample 6 - Belichting ##
Zie code/sample_6 voor uitleg
