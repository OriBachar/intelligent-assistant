import { getImageUrl } from './igdbService';

export interface ExtractedImages {
  covers?: string[];
  screenshots?: string[];
  backgroundImages?: string[];
  trailers?: string[];
}

export function extractImagesFromApiData(apiData: unknown): ExtractedImages {
  const images: ExtractedImages = {};
  
  if (!apiData || typeof apiData !== 'object') {
    return images;
  }

  const data = (apiData as any).data || apiData;
  
  if (data.gameDetails || data.game || data.details) {
    const game = data.gameDetails || data.game || data.details;
    
    if (game.background_image) {
      images.backgroundImages = images.backgroundImages || [];
      images.backgroundImages.push(game.background_image);
    }
    
    if (game.cover_data?.image_id) {
      images.covers = images.covers || [];
      images.covers.push(getImageUrl(game.cover_data.image_id, 'cover_big'));
    } else if (game.cover && typeof game.cover === 'string') {
      images.covers = images.covers || [];
      images.covers.push(getImageUrl(game.cover, 'cover_big'));
    }
    
    if (game.screenshot_data && Array.isArray(game.screenshot_data)) {
      images.screenshots = game.screenshot_data
        .slice(0, 3)
        .map((screenshot: any) => getImageUrl(screenshot.image_id, 'screenshot_big'));
    }
  }
  
  if (data.games && Array.isArray(data.games)) {
    const firstGame = data.games[0];
    
    if (firstGame.background_image) {
      images.backgroundImages = images.backgroundImages || [];
      images.backgroundImages.push(firstGame.background_image);
    }
    
    if (firstGame.cover_data?.image_id) {
      images.covers = images.covers || [];
      images.covers.push(getImageUrl(firstGame.cover_data.image_id, 'cover_big'));
    }
  }
  
  if (data.screenshots && Array.isArray(data.screenshots)) {
    images.screenshots = data.screenshots
      .slice(0, 3)
      .map((screenshot: any) => screenshot.image || screenshot.url)
      .filter((url: string | undefined) => url);
  }
  
  if (data.trailers && Array.isArray(data.trailers)) {
    images.trailers = data.trailers
      .slice(0, 2)
      .map((trailer: any) => {
        if (trailer.data?.max) return trailer.data.max;
        if (trailer.data?.['480']) return trailer.data['480'];
        return trailer.url;
      })
      .filter((url: string | undefined) => url);
  }
  
  if (data.details?.header_image) {
    images.backgroundImages = images.backgroundImages || [];
    images.backgroundImages.push(data.details.header_image);
  }
  
  return images;
}
