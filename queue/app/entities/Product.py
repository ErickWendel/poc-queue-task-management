from __future__ import absolute_import, unicode_literals
from pony.orm import * 
from datetime import datetime

def define_entities(db):
    class Product (db.Entity):
        SECAO = Optional(int)
        GRUPO = Optional(int)
        SUBGRUPO = Optional(int)
        REF_RMS = Optional(str)
        DESCRICAO = Optional(str)
        EAN = Optional(str)
        ALTURA = Optional(float)
        LARGURA = Optional(float)
        COMPRIMENTO = Optional(float)
        UNIDADEMEDIDA = Optional(str)
        FILLER_RMS = Optional(str)
        PESO_UN = Optional(float)
        EST_78 = Optional(int)
        SAIDA_MEDIA = Optional(float)
        ULTIMA_SAIDA = Optional(datetime)
        ULTIMA_ENTRADA = Optional(datetime)
        EST_WEB_78 = Optional(int)
        DTENTRADALINHA = Optional(datetime)
        DTSAIDALINHA = Optional(datetime)
        PRECODE_78 = Optional(float)
        PRECOPOR_78 = Optional(float)
        PRECOOFEXC = Optional(str)
        PRECOPESDE_78 = Optional(float)
        PRECOPESPOR_78 = Optional(float)
        PRECOPESOFEXC = Optional(str)
        PRECOPORKG_78 = Optional(str) 