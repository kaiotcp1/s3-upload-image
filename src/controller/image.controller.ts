
export class ImageController {

  async sendImage(req: any, res: any) {
    res.status(200).json({ message: 'Image sent successfully' });
  };
}