import axios from 'axios';
import xml2js from 'xml2js';

export interface RawJob {
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary?: string;
  link: string;
  postedDate: Date;
  sourceId: string;
}

// Job API sources configuration
export const JOB_SOURCES = {
  jobicy_all: 'https://jobicy.com/?feed=job_feed',
  jobicy_smm: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
  jobicy_seller: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
  jobicy_design: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
  jobicy_data: 'https://jobicy.com/?feed=job_feed&job_categories=data-science',
  jobicy_copy: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
  jobicy_business: 'https://jobicy.com/?feed=job_feed&job_categories=business',
  jobicy_management: 'https://jobicy.com/?feed=job_feed&job_categories=management',
  higheredjobs: 'https://www.higheredjobs.com/rss/articleFeed.cfm',
};

export class JobFetcherService {
  private parser = new xml2js.Parser();

  async fetchJobs(url: string, source: string): Promise<RawJob[]> {
    try {
      console.log(`📥 Fetching jobs from ${source}: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const jsonData = await this.parseXML(response.data);
      const jobs = this.transformJobs(jsonData, source, url);
      
      console.log(`✅ Fetched ${jobs.length} jobs from ${source}`);
      return jobs;
    } catch (error) {
      console.error(`❌ Error fetching from ${source}:`, error);
      throw new Error(`Failed to fetch jobs from ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseXML(xmlString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parser.parseString(xmlString, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  private transformJobs(data: any, source: string, url: string): RawJob[] {
    const jobs: RawJob[] = [];

    // Handle RSS feed format
    if (data.rss?.channel?.[0]?.item) {
      data.rss.channel[0].item.forEach((item: any, index: number) => {
        try {
          const job = this.parseRSSItem(item, source, index);
          jobs.push(job);
        } catch (error) {
          console.error(`Error parsing job item: ${error}`);
        }
      });
    }

    return jobs;
  }

  private parseRSSItem(item: any, source: string, index: number): RawJob {
    const title = item.title?.[0] || 'Untitled';
    const description = item.description?.[0] || '';
    const link = item.link?.[0] || '';
    const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date();

    // Extract company and location from title or description
    const { company, location } = this.extractMetadata(title, description);

    return {
      title: this.cleanText(title),
      description: this.cleanText(description),
      company,
      location,
      jobType: 'Full-time', // Default, can be extracted from data
      category: source.split('_')[1] || 'General',
      link,
      postedDate: pubDate,
      sourceId: `${source}-${index}-${Date.now()}`,
      salary: this.extractSalary(description),
    };
  }

  private extractMetadata(title: string, description: string): { company: string; location: string } {
    // Simple extraction - can be improved with ML or better parsing
    const parts = title.split(' - ');
    let company = 'Unknown';
    let location = 'Remote';

    if (parts.length > 1) {
      company = parts[0].trim();
      location = parts[parts.length - 1].trim();
    }

    return { company, location };
  }

  private extractSalary(text: string): string | undefined {
    const salaryPattern = /(\$[\d,]+|\£[\d,]+|€[\d,]+)/g;
    const matches = text.match(salaryPattern);
    return matches ? matches.join(' - ') : undefined;
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

export default new JobFetcherService();
