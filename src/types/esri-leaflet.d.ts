declare module 'esri-leaflet' {
  import * as L from 'leaflet';

  export interface TiledMapLayerOptions extends L.TileLayerOptions {
    url: string;
    token?: string;
    proxy?: string;
    useCors?: boolean;
  }

  export interface TiledMapLayer extends L.TileLayer {
    authenticate(token: string): this;
    metadata(callback: (error: any, metadata: any) => void): this;
  }

  export function tiledMapLayer(options: TiledMapLayerOptions): TiledMapLayer;

  export interface DynamicMapLayerOptions extends L.LayerOptions {
    url: string;
    token?: string;
    proxy?: string;
    useCors?: boolean;
    opacity?: number;
    layers?: number[];
    layerDefs?: object;
    f?: string;
    format?: string;
    transparent?: boolean;
    dynamicLayers?: object;
  }

  export interface DynamicMapLayer extends L.Layer {
    authenticate(token: string): this;
    metadata(callback: (error: any, metadata: any) => void): this;
    identify(): any;
    query(): any;
    find(): any;
    bindPopup(fn: (error: any, featureCollection: any, response: any) => string | HTMLElement): this;
    unbindPopup(): this;
  }

  export function dynamicMapLayer(options: DynamicMapLayerOptions): DynamicMapLayer;

  export interface FeatureLayerOptions extends L.LayerOptions {
    url: string;
    token?: string;
    proxy?: string;
    useCors?: boolean;
    where?: string;
    fields?: string[];
    from?: Date;
    to?: Date;
    timeField?: boolean | string;
    timeFilterMode?: string;
    simplifyFactor?: number;
    precision?: number;
    style?: (feature: any) => object;
    onEachFeature?: (feature: any, layer: L.Layer) => void;
    pointToLayer?: (geoJsonPoint: any, latlng: L.LatLng) => L.Layer;
  }

  export interface FeatureLayer extends L.Layer {
    authenticate(token: string): this;
    metadata(callback: (error: any, metadata: any) => void): this;
    query(): any;
    addFeature(feature: any, callback?: (error: any, response: any) => void): this;
    updateFeature(feature: any, callback?: (error: any, response: any) => void): this;
    deleteFeature(id: string | number, callback?: (error: any, response: any) => void): this;
    deleteFeatures(ids: string[] | number[], callback?: (error: any, response: any) => void): this;
    refresh(): this;
    redraw(id?: string | number): this;
    setWhere(where: string, callback?: (error: any) => void): this;
    getWhere(): string;
    setTimeRange(from: Date, to: Date, callback?: (error: any) => void): this;
    getTimeRange(): Date[];
    setFeatureStyle(id: string | number, style: object): this;
    resetFeatureStyle(id: string | number): this;
  }

  export function featureLayer(options: FeatureLayerOptions): FeatureLayer;

  export interface BasemapLayerOptions extends L.TileLayerOptions {
    token?: string;
  }

  export function basemapLayer(key: string, options?: BasemapLayerOptions): L.TileLayer;

  export interface ImageMapLayerOptions extends L.LayerOptions {
    url: string;
    token?: string;
    proxy?: string;
    useCors?: boolean;
    format?: string;
    f?: string;
    opacity?: number;
    position?: string;
    maxZoom?: number;
    minZoom?: number;
  }

  export interface ImageMapLayer extends L.Layer {
    authenticate(token: string): this;
    metadata(callback: (error: any, metadata: any) => void): this;
    identify(): any;
    bringToBack(): this;
    bringToFront(): this;
    setBandIds(bandIds: string | string[]): this;
    getBandIds(): string | string[];
    setNoData(noData: number | number[], noDataInterpretation?: string): this;
    getNoData(): number | number[];
    setNoDataInterpretation(noDataInterpretation: string): this;
    getNoDataInterpretation(): string;
    setRenderingRule(renderingRule: object): this;
    getRenderingRule(): object;
    setMosaicRule(mosaicRule: object): this;
    getMosaicRule(): object;
    setPixelType(pixelType: string): this;
    getPixelType(): string;
    redraw(): this;
  }

  export function imageMapLayer(options: ImageMapLayerOptions): ImageMapLayer;

  export interface MapServiceOptions {
    url: string;
    token?: string;
    proxy?: string;
    useCors?: boolean;
  }

  export interface MapService {
    authenticate(token: string): this;
    metadata(callback: (error: any, metadata: any) => void): this;
    identify(): any;
    find(): any;
    query(): any;
  }

  export function mapService(options: MapServiceOptions): MapService;

  export interface Query {
    within(bounds: L.LatLngBounds): this;
    intersects(bounds: L.LatLngBounds | L.Polygon | L.Polyline | L.GeoJSON): this;
    contains(latlng: L.LatLng): this;
    overlaps(bounds: L.LatLngBounds): this;
    nearby(latlng: L.LatLng, radius: number): this;
    where(string: string): this;
    offset(offset: number): this;
    limit(limit: number): this;
    between(from: Date, to: Date): this;
    fields(fields: string[]): this;
    returnGeometry(returnGeometry: boolean): this;
    simplify(map: L.Map, factor: number): this;
    orderBy(fieldName: string, order: string): this;
    featureIds(ids: number[]): this;
    precision(precision: number): this;
    token(token: string): this;
    layer(layer: string | number): this;
    pixelSize(point: L.Point | [number, number]): this;
    run(callback: (error: any, featureCollection: any, response: any) => void): this;
    count(callback: (error: any, count: number, response: any) => void): this;
    ids(callback: (error: any, ids: number[], response: any) => void): this;
    bounds(callback: (error: any, bounds: L.LatLngBounds, response: any) => void): this;
  }

  export function query(options: { url: string }): Query;
}
